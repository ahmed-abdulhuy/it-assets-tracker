from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import schemas
from app.crud import computer as crud_computer
from app.crud import assignment as crud_assignment
from app.crud import status as crud_status
from app.database import get_db
from typing import List

router = APIRouter(prefix="/computers", tags=["Computers"])


@router.post("/", response_model=schemas.ComputerOut, status_code=status.HTTP_201_CREATED)
def create_computer(computer: schemas.ComputerCreate, db: Session = Depends(get_db)):
    return crud_computer.create_computer(db, computer)


@router.get("/", response_model=list[schemas.ComputerOut])
def read_computers(db: Session = Depends(get_db)):
    return crud_computer.get_computers(db)


@router.get("/{computer_id}", response_model=schemas.ComputerOut)
def read_computer(computer_id: int, db: Session = Depends(get_db)):
    db_computer = crud_computer.get_computer(db, computer_id)
    if db_computer is None:
        raise HTTPException(status_code=404, detail="Computer not found")
    return db_computer


@router.get("/{computer_id}/history", response_model=List[schemas.ComputerHistoryEntry])
def get_computer_history(computer_id: int, db: Session = Depends(get_db)):
    return crud_assignment.get_computer_history(db, computer_id)


@router.patch("/{computer_id}", response_model=schemas.ComputerOut)
def update_computer(computer_id: int, computer: schemas.ComputerUpdate, db: Session = Depends(get_db)):
    db_computer = crud_computer.get_computer(db, computer_id)
    if db_computer is None:
        raise HTTPException(status_code=404, detail="Computer not found")
    return crud_computer.update_computer(db, computer_id, computer)


@router.delete("/{computer_id}", response_model=schemas.ComputerOut)
def delete_computer(computer_id: int, db: Session = Depends(get_db)):
    db_computer = crud_computer.get_computer(db, computer_id)
    if db_computer is None:
        raise HTTPException(status_code=404, detail="Computer not found")
    #! Later, add logic to assign a action taker (user) to changed_by
    return crud_computer.delete_computer(db, computer_id, changed_by="API User")


@router.post("/{computer_id}/status", response_model=schemas.ComputerOut)
def change_status(
    computer_id: int,
    payload: schemas.StatusChangeRequest,
    db: Session = Depends(get_db)
):
    return crud_status.change_computer_status(db, computer_id, payload)
 
 
@router.get("/{computer_id}/status-log", response_model=List[schemas.DeviceStatusLogOut])
def get_status_log(computer_id: int, db: Session = Depends(get_db)):
    return crud_status.get_status_log(db, computer_id)
