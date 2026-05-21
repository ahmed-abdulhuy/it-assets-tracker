from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import schemas
from app.crud import computer as crud_computer
from app.database import get_db

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
    return crud_computer.delete_computer(db, computer_id)