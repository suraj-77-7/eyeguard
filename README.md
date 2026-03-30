# Eye Health App

**Repository:** https://github.com/suraj-77-7/eyeguard

## Quick start

1. Ensure Python and Node.js/npm are installed and on PATH.
2. Run `start_all.bat` from the project root:

   - Backend: `python App.py` from `backend/`
   - Frontend: `npm install` and `npm run dev` from `frontend/`

3. Access:
   - Backend: http://127.0.0.1:5000
   - Frontend: http://localhost:5173

## Individual commands

- `run_backend.bat`
- `run_frontend.bat`

## Notes

- The backend uses SQLite `users.db` and model files in `backend/saved_models`.
- If models are missing, run `backend/train_model.py` first.
