from fastapi import FastAPI
from app.routers import employee, device, assignment
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db
from app.routers import status
 
app = FastAPI(title="Asset Management API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend origin
    allow_credentials=True,
    allow_methods=["*"],       # You can restrict this to ['GET', 'POST'] if you want
    allow_headers=["*"],
)

@app.on_event("startup") 
def on_startup():
    init_db()

app.include_router(employee.router)
app.include_router(device.router)
app.include_router(assignment.router)
app.include_router(status.router)

 
@app.get("/health")
def health_check():
    return {"status": "ok"}