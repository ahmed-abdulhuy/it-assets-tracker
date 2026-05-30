from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import schemas
from app.crud import assignment as crud_assignment
from app.database import get_db

router = APIRouter(prefix="/assignments", tags=["Assignments"])


@router.post("/", response_model=schemas.AssignmentOut, status_code=status.HTTP_201_CREATED)
def assign_device(assignment: schemas.AssignmentCreate, db: Session = Depends(get_db)):
    return crud_assignment.assign_device(db, assignment)


@router.get("/", response_model=list[schemas.AssignmentOutDetailed])
def get_assignments(db: Session = Depends(get_db)):
    return crud_assignment.get_assignments(db)


@router.patch("/{assignment_id}/return", response_model=schemas.AssignmentOut)
def return_device(
    assignment_id: int,
    payload: schemas.AssignmentReturn,
    db: Session = Depends(get_db)
):
    return crud_assignment.return_device(db, assignment_id, payload.returned_at)


@router.get("/active/{device_id}", response_model=schemas.AssignmentOut)
def get_active_assignment(device_id: int, db: Session = Depends(get_db)):
    assignment = crud_assignment.get_active_assignment(db, device_id)
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No active assignment found for device {device_id}."
        )
    return assignment


