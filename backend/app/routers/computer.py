from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app import schemas
from app.crud import computer as crud_computer
from app.database import get_db

router = APIRouter(prefix="/computers", tags=["Computers"])


@router.post("/", response_model=schemas.ComputerOut, status_code=status.HTTP_201_CREATED)
def create_computer(computer: schemas.ComputerCreate, db: Session = Depends(get_db)):
    return crud_computer.create_computer(db, computer)