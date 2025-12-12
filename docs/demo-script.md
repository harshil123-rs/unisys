# Demo Script (2-3 minutes)

1. Start backend:
   - cd backend
   - npm install
   - copy .env.example -> .env and fill keys
   - npm start

2. Start frontend:
   - cd frontend
   - npm install
   - npm run dev
   - Open http://localhost:3000

3. Demo steps:
   - Show problem statement slide (info fragmentation)
   - Upload a sample PDF via /api/upload (use Postman or a simple HTML form)
   - Ask question in web chat: 'What docs needed for battery shipment?'
   - Show WhatsApp demo by sending a message to Twilio sandbox (if configured)
   - Open analytics (if implemented) to show top queries and time saved estimate.
