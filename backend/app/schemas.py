from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# =====================================================
# Employee Schemas
# =====================================================

class EmployeeBase(BaseModel):
    first_name: str
    last_name: str
    email: Optional[EmailStr] = None
    job_title: Optional[str] = None
    is_active: bool = True


class EmployeeCreate(EmployeeBase):
    """Used when creating a new employee (POST)."""
    pass

class EmployeeUpdate(BaseModel):
    """Used when updating an employee (PATCH). All fields optional."""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    job_title: Optional[str] = None
    is_active: Optional[bool] = None


class EmployeeOut(EmployeeBase):
    """Returned in API responses."""
    employee_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# =====================================================
# Device Schemas
# =====================================================

class DeviceBase(BaseModel):
    device_type: str
    model: Optional[str] = None
    specs: Optional[str] = None
    status: str = "available"


class DeviceCreate(DeviceBase):
    """Used when registering a new device (POST)."""
    pass


class DeviceUpdate(BaseModel):
    """Used when updating a device (PATCH). All fields optional."""
    device_type: Optional[str] = None
    model: Optional[str] = None
    specs: Optional[str] = None
    status: Optional[str] = None


class DeviceOut(DeviceBase):
    """Returned in API responses."""
    device_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# =====================================================
# Assignment Schemas
# =====================================================

class AssignmentBase(BaseModel):
    device_id: int
    employee_id: int
    assigned_by: Optional[str] = None


class AssignmentCreate(AssignmentBase):
    """Used when assigning a device to an employee (POST)."""
    pass


class AssignmentReturn(BaseModel):
    """Used when marking a device as returned (PATCH)."""
    returned_at: Optional[datetime] = None  # Defaults to now if not provided


class AssignmentOut(AssignmentBase):
    """Returned in API responses."""
    assignment_id: int
    assigned_at: datetime
    returned_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AssignmentOutDetailed(AssignmentOut):
    """Extended response that includes nested employee and device info."""
    employee: EmployeeOut
    device: DeviceOut

    class Config:
        from_attributes = True


# =====================================================
# History Schemas
# =====================================================
 
class DeviceHistoryEntry(BaseModel):
    """One entry in a device's assignment history."""
    assignment_id: int
    employee: EmployeeOut
    assigned_at: datetime
    returned_at: Optional[datetime] = None
    assigned_by: Optional[str] = None
 
    class Config:
        from_attributes = True
 
 
class EmployeeHistoryEntry(BaseModel):
    """One entry in an employee's assignment history."""
    assignment_id: int
    device: DeviceOut
    assigned_at: datetime
    returned_at: Optional[datetime] = None
    assigned_by: Optional[str] = None
 
    class Config:
        from_attributes = True


# =====================================================
# Status Schemas
# =====================================================
 
class DeviceStatusOut(BaseModel):
    status:      str
    label:       str
    color:       str
    description: Optional[str] = None
    is_terminal: bool
 
    class Config:
        from_attributes = True
 
 
class DeviceStatusTransitionOut(BaseModel):
    from_status:     str
    to_status:       str
    label:           Optional[str] = None
    description:     Optional[str] = None
    requires_return: bool
    to_status_obj:   DeviceStatusOut  # includes color + label of the target status
 
    class Config:
        from_attributes = True
 
 
class StatusChangeRequest(BaseModel):
    to_status:  str
    changed_by: Optional[str] = None
    note:       Optional[str] = None
 

class DeviceStatusLogOut(BaseModel):
    log_id:      int
    device_id: int
    from_status: Optional[str] = None
    to_status:   str
    changed_by:  Optional[str] = None
    note:        Optional[str] = None
    changed_at:  datetime
 
    class Config:
        from_attributes = True
