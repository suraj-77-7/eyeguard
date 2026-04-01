from flask import Flask, request, jsonify, send_from_directory, Response
from flask_cors import CORS
import pickle
import numpy as np
import pandas as pd
import sqlite3
import hashlib
import uuid
import os
import json
import csv
import io
from datetime import datetime, timedelta
from functools import lru_cache
from collections import defaultdict
import warnings
import logging
from logging.handlers import RotatingFileHandler
warnings.filterwarnings('ignore')

from flask.json.provider import DefaultJSONProvider

# ================================================
# CONFIG & SETUP
# ================================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "saved_models")
DATASET_FILE = os.path.join(BASE_DIR, "digital_eye_health.csv")

# --- NEW: Custom JSON Provider for Flask 3.x to handle NumPy types ---
class CustomJSONProvider(DefaultJSONProvider):
    def default(self, obj):
        if isinstance(obj, (np.floating, np.float32, np.float64)):
            return float(obj)
        if isinstance(obj, (np.integer, np.int32, np.int64)):
            return int(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        if isinstance(obj, bytes):
            import struct
            try:
                return float(struct.unpack('f', obj)[0]) if len(obj) == 4 else 0.0
            except:
                return 0.0
        return super().default(obj)

app = Flask(__name__)
app.json = CustomJSONProvider(app)
CORS(app)

# ================================================
# LOGGING SETUP
# ================================================
log_formatter = logging.Formatter('[%(asctime)s] %(levelname)s in %(module)s (%(lineno)d): %(message)s')
log_handler = RotatingFileHandler(os.path.join(BASE_DIR, 'eyeguard_error.log'), maxBytes=1024 * 1024, backupCount=5)
log_handler.setFormatter(log_formatter)
log_handler.setLevel(logging.ERROR)
app.logger.addHandler(log_handler)
app.logger.setLevel(logging.ERROR)

@app.errorhandler(Exception)
def handle_unhandled_exception(e):
    app.logger.exception("Unhandled Exception Occurred")
    return jsonify({'error': 'An unexpected internal server error occurred.'}), 500

# Simple in-memory cache for expensive endpoints (EDA)
CACHE_TIMEOUT = 300  # seconds
_cache = {}

@app.route('/api/recommendations', methods=['POST'])
def get_recommendations():
    try:
        data = request.json or {}
        inputs = data.get('features', {})
        risk_level = data.get('risk_level', 'Low')
        
        recs = []
        
        # 1. Screen Time Advice
        st = float(inputs.get('Daily_Screen_Hours', 0))
        if st > 8:
            recs.append({
                'title': 'High Screen Exposure',
                'advice': 'You are exceeding the critical 8-hour threshold. Use "Screen Time" apps to block non-essential use.',
                'impact': 'High'
            })
        elif st > 5:
            recs.append({
                'title': 'Moderate Usage',
                'advice': 'Consider enabling "Dark Mode" globally to reduce ocular fatigue.',
                'impact': 'Medium'
            })

        # 2. Break Frequency
        breaks = float(inputs.get('Break_Frequency_Per_Hour', 0))
        if breaks < 1:
            recs.append({
                'title': 'Break Deficit',
                'advice': 'Set a timer for the 20-20-20 rule. Your eyes need micro-recovery every hour.',
                'impact': 'High'
            })

        # 3. Symptoms (Pain/Dryness)
        dry = float(inputs.get('Eye_Dryness_Level', 0))
        if dry > 5:
            recs.append({
                'title': 'Ocular Dehydration',
                'advice': 'Use preservative-free artificial tears and increase your water intake.',
                'impact': 'High'
            })

        # 4. Blue Light
        bl = inputs.get('Blue_Light_Filter_Used', 0)
        if not bl and st > 4:
            recs.append({
                'title': 'Spectral Exposure',
                'advice': 'Enable system-level blue light filters (Night Shift/Night Light) to preserve sleep quality.',
                'impact': 'Medium'
            })

        # Default if no specific high risk factors
        if not recs:
            recs.append({
                'title': 'Healthy Maintenance',
                'advice': 'Your habits look good! Continue with regular eye checkups and balanced screen use.',
                'impact': 'Low'
            })

        return jsonify({'recommendations': recs})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ================================================
# DATABASE (Enhanced Schema)
# ================================================
DB_PATH = os.path.join(BASE_DIR, 'users.db')

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def init_db():
    conn = get_db()
    c = conn.cursor()

    # --- Users ---
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            token TEXT UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # --- Predictions ---
    c.execute('''
        CREATE TABLE IF NOT EXISTS predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_email TEXT NOT NULL,
            input_data TEXT NOT NULL,
            risk_level TEXT NOT NULL,
            damage_percent REAL NOT NULL,
            risk_score REAL,  -- NEW: numeric 0-100
            model_used TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_email) REFERENCES users(email)
        )
    ''')

    # --- User Preferences (NEW) ---
    c.execute('''
        CREATE TABLE IF NOT EXISTS user_preferences (
            user_email TEXT PRIMARY KEY,
            theme TEXT DEFAULT 'light',
            notifications_enabled INTEGER DEFAULT 1,
            daily_goal_screen_hours REAL DEFAULT 4.0,
            daily_goal_breaks INTEGER DEFAULT 3,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
        )
    ''')

    # --- Daily Streaks (NEW) ---
    c.execute('''
        CREATE TABLE IF NOT EXISTS daily_streaks (
            user_email TEXT NOT NULL,
            date DATE NOT NULL,
            risk_level TEXT NOT NULL,
            is_healthy INTEGER DEFAULT 0, -- 1 if Low risk, else 0
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (user_email, date),
            FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
        )
    ''')

    conn.commit()
    conn.close()
    
    # Safe migration for older databases missing the risk_score column
    try:
        conn = get_db()
        conn.execute("SELECT risk_score FROM predictions LIMIT 1")
        conn.close()
    except Exception:
        conn = get_db()
        conn.execute("ALTER TABLE predictions ADD COLUMN risk_score REAL DEFAULT 0")
        conn.commit()
        conn.close()
        
    # Safe migration for older databases missing the model_used column
    try:
        conn = get_db()
        conn.execute("SELECT model_used FROM predictions LIMIT 1")
        conn.close()
    except Exception:
        conn = get_db()
        conn.execute("ALTER TABLE predictions ADD COLUMN model_used TEXT DEFAULT 'Unknown'")
        conn.commit()
        conn.close()
    # Safe migration for binary data cleanup
    try:
        conn = get_db()
        # Find any rows where risk_score or damage_percent is binary
        c = conn.cursor()
        c.execute("SELECT id, risk_score, damage_percent FROM predictions")
        rows = c.fetchall()
        import struct
        for row in rows:
            needs_fix = False
            rs = row['risk_score']
            dp = row['damage_percent']
            if isinstance(rs, bytes) and len(rs) == 4:
                rs = float(struct.unpack('f', rs)[0])
                needs_fix = True
            if isinstance(dp, bytes) and len(dp) == 4:
                dp = float(struct.unpack('f', dp)[0])
                needs_fix = True
            
            if needs_fix:
                c.execute("UPDATE predictions SET risk_score = ?, damage_percent = ? WHERE id = ?", (rs, dp, row['id']))
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"[WARN] Binary migration failed: {e}")

    print("[OK] Enhanced database initialized (with preferences & streaks).")

init_db()

# ================================================
# DATASET & MODELS LOADING
# ================================================
def load_dataset():
    if not os.path.exists(DATASET_FILE):
        alt = os.path.join(BASE_DIR, "digital_eye_health.csv.xlsx")
        if os.path.exists(alt):
            return pd.read_excel(alt)
        raise FileNotFoundError(DATASET_FILE)
    return pd.read_csv(DATASET_FILE, encoding='utf-8')

def load_pickle(filename):
    path = os.path.join(MODEL_DIR, filename)
    with open(path, 'rb') as f:
        return pickle.load(f)

try:
    models = {
        'logistic': load_pickle('logistic_model.pkl')
    }
    scaler = load_pickle('scaler.pkl')
    feature_names = load_pickle('feature_names.pkl')
    model_results = load_pickle('model_results.pkl')
    label_encoders = load_pickle('label_encoders.pkl')
    print("[OK] All models loaded successfully.")
except Exception as e:
    print(f"[ERROR] Model loading failed: {e}")
    models = {}
    scaler = None
    feature_names = []
    model_results = {}
    label_encoders = {}

# ================================================
# UTILITIES
# ================================================
def hash_password(pwd): return hashlib.sha256(pwd.encode()).hexdigest()

def get_user_by_token(token):
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT * FROM users WHERE token = ?", (token,))
    user = c.fetchone()
    conn.close()
    return user

def calculate_streak(user_email):
    """Calculate current and best streak of consecutive 'Low' risk days."""
    conn = get_db()
    c = conn.cursor()
    c.execute("""
        SELECT date, is_healthy 
        FROM daily_streaks 
        WHERE user_email = ? 
        ORDER BY date DESC
    """, (user_email,))
    rows = c.fetchall()
    conn.close()

    if not rows:
        return {"current": 0, "best": 0}

    current = 0
    best = 0
    temp = 0

    # Count current streak (from today backwards)
    today = datetime.now().date()
    for row in rows:
        row_date = datetime.strptime(row['date'], '%Y-%m-%d').date()
        if row_date == today - timedelta(days=current) and row['is_healthy']:
            current += 1
        else:
            break

    # Count best streak ever
    for row in rows:
        if row['is_healthy']:
            temp += 1
            best = max(best, temp)
        else:
            temp = 0

    return {"current": current, "best": best}

def get_risk_trend(user_email):
    """Compare last 2 predictions to determine trend."""
    conn = get_db()
    c = conn.cursor()
    c.execute("""
        SELECT risk_score, created_at 
        FROM predictions 
        WHERE user_email = ? 
        ORDER BY created_at DESC 
        LIMIT 5
    """, (user_email,))
    rows = c.fetchall()
    conn.close()

    if len(rows) < 2:
        return "stable"

    scores = []
    for r in rows:
        val = r['risk_score']
        try:
            if isinstance(val, bytes):
                # Handle potential binary blob from numpy types
                import struct
                fval = struct.unpack('f', val)[0] if len(val) == 4 else 0.0
            else:
                fval = float(val or 0)
            scores.append(fval)
        except:
            scores.append(0.0)

    if len(scores) >= 4:
        recent = sum(scores[:2]) / 2.0
        older = sum(scores[2:4]) / 2.0
    elif len(scores) == 3:
        recent = sum(scores[:2]) / 2.0
        older = scores[2]
    else:
        recent = scores[0]
        older = scores[1]

    if recent < older - 5:
        return "improving"
    elif recent > older + 5:
        return "declining"
    else:
        return "stable"
def jsonify_row(row):
    d = dict(row)
    for k, v in d.items():
        if isinstance(v, bytes):
            import struct
            try:
                d[k] = float(struct.unpack('f', v)[0]) if len(v) == 4 else 0.0
            except:
                d[k] = 0.0
    return d

# ================================================
# ROUTES: API INFO
# ================================================
@app.route('/')
def home():
    return jsonify({
        'name': 'EyeGuard API Server',
        'version': '2.0 Premium',
        'status': 'active',
        'endpoints': ['/api/predict', '/api/eda', '/api/health', '/api/history']
    })

# ================================================
# ROUTE: EMAIL AVAILABILITY (NEW – for registration UX)
# ================================================
@app.route('/api/check-email', methods=['POST'])
def check_email():
    data = request.json or {}
    email = data.get('email', '').strip().lower()
    if not email:
        return jsonify({'error': 'Email required'}), 400

    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT 1 FROM users WHERE email = ?", (email,))
    exists = c.fetchone() is not None
    conn.close()
    return jsonify({'exists': exists, 'available': not exists})

# ================================================
# ROUTE: REGISTER (Enhanced with preferences init)
# ================================================
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not all([name, email, password]):
        return jsonify({'error': 'All fields required'}), 400
    if len(password) < 6:
        return jsonify({'error': 'Password must be ≥6 characters'}), 400

    conn = get_db()
    c = conn.cursor()
    token = str(uuid.uuid4())

    try:
        c.execute(
            "INSERT INTO users (name, email, password, token) VALUES (?, ?, ?, ?)",
            (name, email, hash_password(password), token)
        )
        # Init default preferences
        c.execute(
            "INSERT INTO user_preferences (user_email) VALUES (?)",
            (email,)
        )
        conn.commit()
        print(f"[AUTH] New user: {email}")
        return jsonify({'message': 'Account created', 'token': token, 'name': name, 'email': email}), 201
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Email already registered'}), 409
    finally:
        conn.close()

# ================================================
# ROUTE: LOGIN
# ================================================
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'error': 'Credentials required'}), 400

    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT name, email, token FROM users WHERE email = ? AND password = ?",
              (email, hash_password(password)))
    user = c.fetchone()
    conn.close()

    if user:
        print(f"[AUTH] Login: {email}")
        return jsonify({'message': 'Welcome back', 'name': user['name'],
                       'email': user['email'], 'token': user['token']})
    return jsonify({'error': 'Invalid credentials'}), 401

# ================================================
# ROUTE: USER PREFERENCES (NEW)
# ================================================
@app.route('/api/preferences', methods=['GET', 'POST'])
def preferences():
    data = request.json or {}
    token = data.get('token')
    if not token:
        return jsonify({'error': 'Unauthorized'}), 401

    user = get_user_by_token(token)
    if not user:
        return jsonify({'error': 'Invalid token'}), 401

    conn = get_db()
    c = conn.cursor()

    if request.method == 'GET':
        c.execute("SELECT * FROM user_preferences WHERE user_email = ?", (user['email'],))
        pref = c.fetchone()
        conn.close()
        return jsonify(dict(pref) if pref else {'theme': 'light', 'notifications_enabled': 1})

    # POST – Update
    theme = data.get('theme', 'light')
    notifs = data.get('notifications_enabled', 1)
    goal_hours = float(data.get('daily_goal_screen_hours', 4))
    goal_breaks = int(data.get('daily_goal_breaks', 3))

    c.execute("""
        REPLACE INTO user_preferences (user_email, theme, notifications_enabled, 
                                     daily_goal_screen_hours, daily_goal_breaks, updated_at)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    """, (user['email'], theme, notifs, goal_hours, goal_breaks))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Preferences saved'})

# ================================================
# ROUTE: PREDICT (Massively Enhanced)
# ================================================
@app.route('/api/predict', methods=['POST'])
def predict():
    if not models:
        return jsonify({'error': 'Models not loaded'}), 500

    data = request.json or {}
    input_vals = data.get('features', {})
    if not input_vals:
        return jsonify({'error': 'No features provided'}), 400

    # --- Input validation & scaling ---
    try:
        features_list = []
        for f in feature_names:
            # Skip Role if it's not in our trained feature names
            if f == "Role":
                continue
            val = input_vals.get(f, 0)
            if f in label_encoders and isinstance(val, str):
                # Transform string variables using loaded label_encoders, defaulting to 0 for unseen labels
                val = label_encoders[f].transform([val])[0] if val in label_encoders[f].classes_ else 0
            features_list.append(float(val))
        arr = np.array([features_list])
        arr_scaled = scaler.transform(arr)
    except Exception as e:
        app.logger.error(f"Input validation failed: {str(e)}", exc_info=True)
        return jsonify({'error': f'Invalid input: {str(e)}'}), 400

    # --- Run all models ---
    results = {}
    # Class order from LabelEncoder: ['High', 'Low', 'Medium']
    # index 0: High, index 1: Low, index 2: Medium
    for key, model in models.items():
        try:
            pred_raw = model.predict(arr_scaled)[0]
            # Convert prediction index to string label
            # le_target = label_encoders['Digital_Eye_Strain_Risk']
            # pred_label = le_target.inverse_transform([pred_raw])[0]
            
            if hasattr(model, 'predict_proba'):
                proba = model.predict_proba(arr_scaled)[0]
                # Weighted score: High=100%, Medium=50%, Low=10%
                damage = (proba[0] * 100) + (proba[2] * 50) + (proba[1] * 10)
                conf = float(max(proba)) * 100
            else:
                damage = 50.0
                conf = 75.0

            # Determine risk based on damage score
            risk = 'High' if damage >= 60 else 'Moderate' if damage >= 30 else 'Low'
            
            results[key] = {
                'prediction': str(pred_raw),
                'damage_percent': float(round(damage, 1)),
                'confidence': float(round(conf, 1)),
                'risk_level': str(risk),
                'risk_score': float(round(damage, 1)),
                'probabilities': {
                    'High': float(proba[0]),
                    'Low': float(proba[1]),
                    'Medium': float(proba[2])
                }
            }
        except Exception as e:
            app.logger.error(f"Model {key} prediction failed: {str(e)}", exc_info=True)
            results[key] = {'error': str(e)}

    # --- Consensus & recommendations ---
    valid_results = {k: v for k, v in results.items() if 'error' not in v}
    if not valid_results:
        return jsonify({'error': 'All models failed to process the input'}), 500
        
    best_model = min(valid_results.items(), key=lambda x: x[1].get('damage_percent', 999))
    consensus = best_model[1]

    # Smart recommendations based on inputs
    recs = []
    screen = float(input_vals.get('Daily_Screen_Hours', input_vals.get('Screen_Time', 0)))
    breaks = float(input_vals.get('Break_Frequency_Per_Hour', input_vals.get('Breaks', 0)))
    blue = float(input_vals.get('Blue_Light_Filter_Used', 0))
    night = float(input_vals.get('Night_Usage', 0))
    dist = float(input_vals.get('Screen_Distance', 20))

    if screen > 6:
        recs.append({'icon': '📱', 'title': 'Reduce Screen Time',
                    'text': f'You use screens for {int(screen)}h daily. Aim for ≤4h to protect your eyes.'})
    if breaks < 3:
        recs.append({'icon': '⏸️', 'title': 'Take Breaks',
                    'text': 'Follow the 20-20-20 rule: every 20 min, look 20 ft away for 20 sec.'})
    if blue == 0:
        recs.append({'icon': '🔵', 'title': 'Enable Blue Light Filter',
                    'text': 'Blue light disrupts sleep and strains eyes. Turn on Night Mode.'})
    if night > 2:
        recs.append({'icon': '🌙', 'title': 'Limit Night Usage',
                    'text': f'{int(night)}h of night screen time detected. Avoid screens 1h before bed.'})
    if dist < 15:
        recs.append({'icon': '📏', 'title': 'Increase Distance',
                    'text': 'Keep screens 18–24 inches away to reduce eye muscle strain.'})
    if not recs:
        recs.append({'icon': '✅', 'title': 'Great Habits!',
                    'text': 'Your screen habits are healthy. Keep it up and schedule annual eye exams.'})

    # --- Save & Streak Logic (if logged in) ---
    token = data.get('token')
    streak_info = {"current": 0, "best": 0}
    trend = "stable"
    personal_insight = "Keep tracking to see your trends!"

    if token:
        user = get_user_by_token(token)
        if user:
            email = user['email']
            today = datetime.now().date().isoformat()

            # Save prediction
            conn = get_db()
            c = conn.cursor()
            c.execute("""
                INSERT INTO predictions 
                (user_email, input_data, risk_level, damage_percent, risk_score, model_used)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (email, json.dumps(input_vals), str(consensus['risk_level']),
                  float(consensus['damage_percent']), float(consensus['risk_score']), str(best_model[0])))
            
            # Update streak table
            is_healthy = 1 if consensus['risk_level'] == 'Low' else 0
            c.execute("""
                REPLACE INTO daily_streaks (user_email, date, risk_level, is_healthy)
                VALUES (?, ?, ?, ?)
            """, (email, today, consensus['risk_level'], is_healthy))

            conn.commit()
            conn.close()

            # Calculate stats
            streak_info = calculate_streak(email)
            trend = get_risk_trend(email)
            
            # Personal insight
            if trend == "improving":
                personal_insight = "🌟 Your risk is trending *down* — great improvement!"
            elif trend == "declining":
                personal_insight = "⚠️ Your risk is rising. Try reducing screen time or taking more breaks."
            else:
                personal_insight = "📊 Your risk is stable. Consistent habits are key!"

    return jsonify({
        'results': results,
        'consensus': consensus,
        'recommendations': recs,
        'streak': streak_info,           # NEW
        'trend': trend,                   # NEW
        'insight': personal_insight,      # NEW
        'timestamp': datetime.now().isoformat()
    })

# ================================================
# ROUTE: BREAK SCHEDULER (NEW – Smart Planning)
# ================================================
@app.route('/api/break-schedule', methods=['POST'])
def break_schedule():
    """Generate a break schedule based on screen hours."""
    data = request.json or {}
    hours = float(data.get('screen_hours', 4))
    if hours <= 0:
        return jsonify({'error': 'Invalid hours'}), 400

    # 20-20-20 rule: break every 20 min
    total_min = int(hours * 60)
    breaks = []
    for m in range(20, total_min + 1, 20):
        breaks.append({
            'time': f"{m//60}:{m%60:02d}",
            'action': 'Look 20ft away for 20s'
        })

    return jsonify({
        'total_hours': hours,
        'break_count': len(breaks),
        'schedule': breaks[:20],  # limit to first 20 to avoid huge payloads
        'tip': 'Set a timer for every 20 minutes to protect your eyes.'
    })

# ================================================
# ROUTE: DAILY TIPS (NEW – Personalized)
# ================================================
@app.route('/api/tips', methods=['GET'])
def daily_tips():
    token = request.args.get('token')
    tips_pool = [
        {'icon': '💧', 'title': 'Blink Often', 'text': 'Blink 15x/minute to prevent dry eyes.'},
        {'icon': '🥗', 'title': 'Eat Eye-Healthy Foods', 'text': 'Carrots, spinach, and fish support vision.'},
        {'icon': '🌞', 'title': '20-20-20 Rule', 'text': 'Every 20 min, look 20ft away for 20s.'},
        {'icon': '😴', 'title': 'Sleep Well', 'text': '7–8 hours of sleep reduces eye strain.'},
        {'icon': '🕶️', 'title': 'Use Good Lighting', 'text': 'Avoid glare; use ambient lighting when reading.'}
    ]

    # If user logged in, personalize based on recent risk
    if token:
        user = get_user_by_token(token)
        if user:
            conn = get_db()
            c = conn.cursor()
            c.execute("""SELECT risk_level FROM predictions 
                         WHERE user_email = ? ORDER BY created_at DESC LIMIT 1""", (user['email'],))
            last = c.fetchone()
            conn.close()
            if last and last['risk_level'] == 'High':
                return jsonify({'tip_of_the_day': {
                    'icon': '🚨', 'title': 'Urgent: Rest Your Eyes',
                    'text': 'Your last risk was HIGH. Take a 15-min screen break now.'
                }, 'date': datetime.now().date().isoformat()})

    import random
    tip = random.choice(tips_pool)
    return jsonify({'tip_of_the_day': tip, 'date': datetime.now().date().isoformat()})

# ================================================
# ROUTE: EXPORT HISTORY (NEW – Download CSV/JSON)
# ================================================
@app.route('/api/export', methods=['GET'])
def export_history():
    token = request.args.get('token')
    fmt = request.args.get('format', 'json').lower()
    if not token:
        return jsonify({'error': 'Unauthorized'}), 401

    user = get_user_by_token(token)
    if not user:
        return jsonify({'error': 'Invalid token'}), 401

    conn = get_db()
    c = conn.cursor()
    c.execute("""
        SELECT risk_level, damage_percent, model_used, created_at 
        FROM predictions 
        WHERE user_email = ? 
        ORDER BY created_at DESC
    """, (user['email'],))
    rows = c.fetchall()
    conn.close()

    if fmt == 'csv':
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(['Date', 'Risk Level', 'Damage %', 'Model'])
        for r in rows:
            writer.writerow([r['created_at'], r['risk_level'], r['damage_percent'], r['model_used']])
        return Response(output.getvalue(), mimetype='text/csv',
                        headers={"Content-Disposition": "attachment;filename=eyeguard_history.csv"})
    else:
        return jsonify([jsonify_row(r) for r in rows])

# ================================================
# ROUTE: USER STATS (Enhanced with streak & trend)
# ================================================
@app.route('/api/user-stats', methods=['POST'])
def user_stats():
    data = request.json or {}
    token = data.get('token')
    if not token:
        return jsonify({'error': 'Token required'}), 400

    user = get_user_by_token(token)
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401

    conn = get_db()
    c = conn.cursor()

    c.execute("SELECT COUNT(*) as total FROM predictions WHERE user_email = ?", (user['email'],))
    total = c.fetchone()['total']

    c.execute("SELECT AVG(damage_percent) as avg FROM predictions WHERE user_email = ?", (user['email'],))
    avg = round(c.fetchone()['avg'] or 0, 1)

    c.execute("""SELECT risk_level, COUNT(*) as cnt FROM predictions 
                 WHERE user_email = ? GROUP BY risk_level""", (user['email'],))
    breakdown = {r['risk_level']: r['cnt'] for r in c.fetchall()}

    c.execute("""SELECT risk_level FROM predictions 
                 WHERE user_email = ? ORDER BY created_at DESC LIMIT 1""", (user['email'],))
    last = c.fetchone()

    conn.close()

    streak = calculate_streak(user['email'])
    trend = get_risk_trend(user['email'])

    return jsonify({
        'name': user['name'],
        'email': user['email'],
        'member_since': user['created_at'],
        'total_predictions': total,
        'avg_damage': avg,
        'risk_breakdown': breakdown,
        'last_risk': last['risk_level'] if last else None,
        'streak': streak,          # NEW
        'trend': trend,            # NEW
        'next_milestone': f"{streak['current'] + 1} days" if streak['current'] < streak['best'] else "New record!"
    })

# ================================================
# ROUTE: HISTORY (Enhanced with pagination)
# ================================================
@app.route('/api/history', methods=['POST'])
def history():
    data = request.json or {}
    token = data.get('token')
    limit = min(int(data.get('limit', 20)), 100)  # cap at 100

    if not token:
        return jsonify({'error': 'Token required'}), 400

    user = get_user_by_token(token)
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401

    conn = get_db()
    c = conn.cursor()
    c.execute("""
        SELECT risk_level, damage_percent, risk_score, model_used, created_at 
        FROM predictions 
        WHERE user_email = ? 
        ORDER BY created_at DESC 
        LIMIT ?
    """, (user['email'], limit))
    rows = c.fetchall()
    conn.close()

    return jsonify({'history': [jsonify_row(r) for r in rows], 'count': len(rows)})

# ================================================
# ROUTE: EDA (Cached to avoid lag)
# ================================================
@app.route('/api/eda', methods=['GET'])
def get_eda():
    cache_key = 'eda_data'
    if cache_key in _cache and (datetime.now().timestamp() - _cache[cache_key]['ts']) < CACHE_TIMEOUT:
        return jsonify(_cache[cache_key]['data'])

    try:
        df = load_dataset()
        print(f"[EDA] Dataset loaded: {df.shape}")
    except Exception as e:
        app.logger.error(f"Failed to load dataset for EDA: {str(e)}", exc_info=True)
        return jsonify({'error': f"Dataset not found or invalid: {str(e)}"}), 500

    target_col = 'Risk_Level'
    if 'Digital_Eye_Strain_Risk' in df.columns:
        target_col = 'Digital_Eye_Strain_Risk'
    elif 'Risk_Level' in df.columns:
        target_col = 'Risk_Level'
    else:
        target_col = df.columns[-1]
        
    target_dist = df[target_col].value_counts().to_dict()

    screen_dist = {}
    if 'Daily_Screen_Hours' in df.columns:
        bins = [0, 4, 8, 12, 24]
        labels = ['0-4', '4-8', '8-12', '12+']
        screen_dist = pd.cut(df['Daily_Screen_Hours'], bins=bins, labels=labels).value_counts().to_dict()

    age_risk = {}
    if 'Age' in df.columns:
        risk_map = {'High': 1.0, 'Moderate': 0.5, 'Medium': 0.5, 'Low': 0.0}
        df['risk_num'] = df[target_col].map(lambda x: risk_map.get(x, 0) if isinstance(x, str) else float(x))
        bins = [0, 18, 30, 45, 60, 100]
        labels = ['<18', '18-30', '31-45', '46-60', '60+']
        df['Age_Group'] = pd.cut(df['Age'], bins=bins, labels=labels)
        age_risk = df.groupby('Age_Group')['risk_num'].mean().fillna(0).to_dict()

    numeric_df = df.select_dtypes(include=[np.number])
    correlations = {}
    if not numeric_df.empty and 'risk_num' in df.columns:
        corr_matrix = numeric_df.corr()
        if 'risk_num' in corr_matrix:
            correlations = corr_matrix['risk_num'].drop('risk_num').fillna(0).to_dict()

    stats = {
        'total_records': int(df.shape[0]),
        'total_features': int(df.shape[1]),
        'missing_values': {str(k): int(v) for k, v in df.isnull().sum().to_dict().items()},
        'target_column': str(target_col),
        'columns': [str(c) for c in df.columns.tolist()],
        'risk_levels': list(target_dist.keys()),
        'target_distribution': {str(k): int(v) for k, v in target_dist.items()},
        'correlations': {str(k): float(v) for k, v in correlations.items()},
        'screen_distribution': {str(k): int(v) for k, v in screen_dist.items()},
        'age_risk': {str(k): float(v) for k, v in age_risk.items()}
    }
    
    _cache[cache_key] = {'data': stats, 'ts': datetime.now().timestamp()}
    return jsonify(stats)

# ================================================
# ROUTE: MODEL COMPARISON (Cached)
# ================================================
@app.route('/api/model-comparison', methods=['GET'])
def model_comparison():
    if not models or not model_results:
        return jsonify({'error': 'Models or results not loaded'}), 500
    
    # Simple cache key
    if 'model_comp' in _cache and (datetime.now().timestamp() - _cache['model_comp']['ts']) < CACHE_TIMEOUT:
        return jsonify(_cache['model_comp']['data'])

    comp = {}
    best_name = None
    best_acc = -1

    for name, res in model_results.items():
        comp_entry = {
            'accuracy': float(round(float(res.get('test_accuracy', 0)), 2)),
            'precision': float(round(float(res.get('test_precision', 0)), 2)),
            'recall': float(round(float(res.get('test_recall', 0)), 2)),
            'f1_score': float(round(float(res.get('test_f1', 0)), 2))
        }
        comp[name] = comp_entry
        
        if comp_entry['accuracy'] > best_acc:
            best_acc = comp_entry['accuracy']
            best_name = name

    feature_importance = []

    payload = {
        'comparison': comp,
        'best_model': best_name,
        'feature_importance': feature_importance[:10]
    }
    _cache['model_comp'] = {'data': payload, 'ts': datetime.now().timestamp()}
    return jsonify(payload)

# ================================================
# HEALTH CHECK
# ================================================
@app.route('/api/health')
def health():
    return jsonify({
        'status': 'healthy',
        'models_loaded': list(models.keys()),
        'timestamp': datetime.now().isoformat(),
        'version': '2.0 Premium'
    })

# ================================================
# RUN SERVER
# ================================================
if __name__ == '__main__':
    print("\n" + "=" * 60)
    # Use ASCII-only banner so Windows cp1252 consoles do not crash.
    print("  EyeGuard API Server - Premium Edition")
    print("  http://localhost:5000")
    print("=" * 60)
    print(f"  Models: {list(models.keys())}")
    print(f"  Features: {len(feature_names)}")
    print("=" * 60 + "\n")
    
    try:
        from waitress import serve
        serve(app, host="0.0.0.0", port=5000)
    except ImportError:
        print("[INFO] Waitress not installed. Running standard Flask development server...")
        app.run(host="0.0.0.0", port=5000, debug=True, use_reloader=False)
    except OSError as e:
        print(f"\n[FATAL ERROR] Port 5000 is already in use! ({e})")
        print("👉 FIX: You have another terminal window running the server in the background.")
        print("👉 Please close ALL terminal windows (or restart VS Code) and try again!\n")