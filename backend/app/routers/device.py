from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import schemas
from app.crud import device as crud_device
from app.crud import assignment as crud_assignment
from app.crud import status as crud_status
from app.database import get_db
from typing import List

router = APIRouter(prefix="/devices", tags=["Devices"])

# Add device
@router.post("/", response_model=schemas.DeviceOut, status_code=status.HTTP_201_CREATED)
def create_device(device: schemas.DeviceCreate, db: Session = Depends(get_db)):
    return crud_device.create_device(db, device)

# Get all devices
@router.get("/", response_model=list[schemas.DeviceOut])
def read_devices(db: Session = Depends(get_db)):
    return crud_device.get_devices(db)


@router.get("/{device_id}", response_model=schemas.DeviceOut)
def read_device(device_id: int, db: Session = Depends(get_db)):
    db_device = crud_device.get_device(db, device_id)
    if db_device is None:
        raise HTTPException(status_code=404, detail="Device not found")
    return db_device


@router.get("/{device_id}/history", response_model=List[schemas.DeviceHistoryEntry])
def get_device_history(device_id: int, db: Session = Depends(get_db)):
    return crud_assignment.get_device_history(db, device_id)


@router.patch("/{device_id}", response_model=schemas.DeviceOut)
def update_device(device_id: int, device: schemas.DeviceUpdate, db: Session = Depends(get_db)):
    db_device = crud_device.get_device(db, device_id)
    if db_device is None:
        raise HTTPException(status_code=404, detail="Device not found")
    return crud_device.update_device(db, device_id, device)


@router.delete("/{device_id}", response_model=schemas.DeviceOut)
def delete_device(device_id: int, db: Session = Depends(get_db)):
    db_device = crud_device.get_device(db, device_id)
    if db_device is None:
        raise HTTPException(status_code=404, detail="Device not found")
    #! Later, add logic to assign a action taker (user) to changed_by
    return crud_device.delete_device(db, device_id, changed_by="API User")


@router.post("/{device_id}/status", response_model=schemas.DeviceOut)
def change_status(
    device_id: int,
    payload: schemas.StatusChangeRequest,
    db: Session = Depends(get_db)
):
    return crud_status.change_device_status(db, device_id, payload)
 
 
@router.get("/{device_id}/status-log", response_model=List[schemas.DeviceStatusLogOut])
def get_status_log(device_id: int, db: Session = Depends(get_db)):
    return crud_status.get_status_log(db, device_id)
