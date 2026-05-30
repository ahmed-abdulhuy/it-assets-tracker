from fastapi import APIRouter, Depends
from typing import List
from sqlalchemy.orm import Session
from app import schemas
from app.crud import status as crud_status
from app.database import get_db

router = APIRouter(prefix="/statuses", tags=["Statuses"])


@router.get("/", response_model=List[schemas.DeviceStatusOut])
def list_statuses(db: Session = Depends(get_db)):
    return crud_status.get_all_statuses(db)


@router.get("/{status}/transitions", response_model=List[schemas.DeviceStatusTransitionOut])
def list_transitions(status: str, db: Session = Depends(get_db)):
    return crud_status.get_transitions_from(db, status)