def test_add_device(client):
    response = client.post("/devices", json={
        "device_type": "Test_Laptop",
        "model": "Test Model",
        "specs": "Intel Core i7, 16GB RAM, 512GB SSD",
        "status": "available"
    })

    assert response.status_code == 201
    data = response.json()
    assert data["device_type"] == "Test_Laptop"
    assert data["model"] == "Test Model"
    assert data["specs"] == "Intel Core i7, 16GB RAM, 512GB SSD"
    assert data["status"] == "available"
    assert "device_id" in data
    assert "created_at" in data
    assert "updated_at" in data



def test_get_devices(client):
    # First, add a device to ensure there's at least one device in the database
    client.post("/devices", json={
        "device_type": "Test_Laptop",
        "model": "Test Model",
        "specs": "Intel Core i7, 16GB RAM, 512GB SSD",
        "status": "available"
    })

    response = client.get("/devices")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    for device in data:
        assert "device_id" in device
        assert "device_type" in device
        assert "model" in device
        assert "specs" in device
        assert "status" in device
        assert "created_at" in device
        assert "updated_at" in device


def test_get_device_by_id(client):
    # First, add a device to ensure there's at least one device in the database
    post_response = client.post("/devices", json={
        "device_type": "Test_Laptop",
        "model": "Test Model",
        "specs": "Intel Core i7, 16GB RAM, 512GB SSD",
        "status": "available"
    })
    assert post_response.status_code == 201
    created_device = post_response.json()
    device_id = created_device["device_id"]

    response = client.get(f"/devices/{device_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["device_id"] == device_id
    assert data["device_type"] == "Test_Laptop"
    assert data["model"] == "Test Model"
    assert data["specs"] == "Intel Core i7, 16GB RAM, 512GB SSD"
    assert data["status"] == "available"
    assert "created_at" in data
    assert "updated_at" in data


def test_get_device_by_id_not_found(client):
    response = client.get("/devices/9999")  # Assuming this ID doesn't exist
    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "Device not found"


def test_update_device(client):
    # First, add a device to ensure there's at least one device in the database
    post_response = client.post("/devices", json={
        "device_type": "Test_Laptop",
        "model": "Test Model",
        "specs": "Intel Core i7, 16GB RAM, 512GB SSD",
        "status": "available"
    })
    assert post_response.status_code == 201
    created_device = post_response.json()
    device_id = created_device["device_id"]

    # Update the device
    response = client.patch(f"/devices/{device_id}", json={
        "model": "Updated Model",
        "specs": "Intel Core i7, 32GB RAM, 1TB SSD"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["device_id"] == device_id
    assert data["device_type"] == "Test_Laptop"
    assert data["model"] == "Updated Model"
    assert data["specs"] == "Intel Core i7, 32GB RAM, 1TB SSD"
    assert data["status"] == "available"  # Status should remain unchanged
    assert "created_at" in data
    assert "updated_at" in data


def test_update_device_not_found(client):
    response = client.patch("/devices/9999", json={
        "model": "Updated Model"
    })  # Assuming this ID doesn't exist
    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "Device not found"



def test_delete_device(client):
    # First, add a device to ensure there's at least one device in the database
    post_response = client.post("/devices", json={
        "device_type": "Test_Laptop",
        "model": "Test Model",
        "specs": "Intel Core i7, 16GB RAM, 512GB SSD",
        "status": "available"
    })
    assert post_response.status_code == 201
    created_device = post_response.json()
    device_id = created_device["device_id"]

    # Delete the device
    response = client.delete(f"/devices/{device_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["device_id"] == device_id

    # Verify the device status change to "retired"
    assert data["status"] == "retired"


def test_get_device_history(client):
    # First, add a device to ensure there's at least one device in the database
    device_post_response = client.post("/devices", json={
        "device_type": "Test_Laptop",
        "model": "Test Model",
        "specs": "Intel Core i7, 16GB RAM, 512GB SSD",
        "status": "available"
    })
    
    assert device_post_response.status_code == 201
    created_device = device_post_response.json()
    device_id = created_device["device_id"]


    # Second, add an employee to ensure there's at least one employee in the database
    employee_post_response = client.post("/employees", json={
        "first_name": "Test_Employee_First",
        "last_name": "Test_Employee_Last",
        "email": "test.employee@example.com",
        "job_title": "Tester",
        "is_active": True
    })

    assert employee_post_response.status_code == 201
    created_employee = employee_post_response.json()
    employee_id = created_employee["employee_id"]
    
    # Third, create an assignment to ensure there's at least one assignment in the database
    assignment_post_response = client.post("/assignments", json={
        "device_id": device_id,
        "employee_id": employee_id,
        "assigned_by": "Test User"
    })

    assert assignment_post_response.status_code == 201
    created_assignment = assignment_post_response.json()


    # Get device history
    response = client.get(f"/devices/{device_id}/history")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    for entry in data:
        assert "employee" in entry
        assert "assigned_at" in entry
        assert "returned_at" in entry
        assert "assignment_id" in entry
        assert entry["employee"]["employee_id"] == employee_id
        assert "assigned_by" in entry
        assert entry["assigned_by"] == "Test User"

def test_change_device_status(client):
    # First, add a device to ensure there's at least one device in the database
    post_response = client.post("/devices", json={
        "device_type": "Test_Laptop",
        "model": "Test Model",
        "specs": "Intel Core i7, 16GB RAM, 512GB SSD",
        "status": "available"
    })
    assert post_response.status_code == 201
    created_device = post_response.json()
    device_id = created_device["device_id"]

    # Change device status to "assigned"
    response = client.post(f"/devices/{device_id}/status", json={
        "to_status": "maintenance",
        "changed_by": "Test User",
        "note": "Assign device for Maintenance"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["device_id"] == device_id
    assert data["status"] == "maintenance"


def test_change_device_status_invalid_status(client):
    # First, add a device to ensure there's at least one device in the database
    post_response = client.post("/devices", json={
        "device_type": "Test_Laptop",
        "model": "Test Model",
        "specs": "Intel Core i7, 16GB RAM, 512GB SSD",
        "status": "available"
    })
    assert post_response.status_code == 201
    created_device = post_response.json()
    device_id = created_device["device_id"]

    # Attempt to change device status to an invalid status
    response = client.post(f"/devices/{device_id}/status", json={
        "to_status": "invalid_status",
        "changed_by": "Test User",
        "note": "Attempting to set an invalid status"
    })
    assert response.status_code == 400
    data = response.json()
    assert data["detail"] == "Unknown status 'invalid_status'."


def test_change_device_status_not_allowed_transition(client):
    # First, add a device to ensure there's at least one device in the database
    post_response = client.post("/devices", json={
        "device_type": "Test_Laptop",
        "model": "Test Model",
        "specs": "Intel Core i7, 16GB RAM, 512GB SSD",
        "status": "available"
    })
    assert post_response.status_code == 201
    created_device = post_response.json()
    device_id = created_device["device_id"]

    # Change device status to "retired"
    response = client.post(f"/devices/{device_id}/status", json={
        "to_status": "retired",
        "changed_by": "Test User",
        "note": "Retiring device"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["device_id"] == device_id
    assert data["status"] == "retired"

    # Attempt to change status from "retired" back to "available"
    response = client.post(f"/devices/{device_id}/status", json={
        "to_status": "available",
        "changed_by": "Test User",
        "note": "Attempting to reactivate retired device"
    })
    assert response.status_code == 422
    data = response.json()
    assert data["detail"] == "Transition from 'retired' to 'available' is not allowed."


def test_get_device_status_log(client):
    # First, add a device to ensure there's at least one device in the database
    post_response = client.post("/devices", json={
        "device_type": "Test_Laptop",
        "model": "Test Model",
        "specs": "Intel Core i7, 16GB RAM, 512GB SSD",
        "status": "available"
    })
    assert post_response.status_code == 201
    created_device = post_response.json()
    device_id = created_device["device_id"]

    # Change device status to "maintenance"
    client.post(f"/devices/{device_id}/status", json={
        "to_status": "maintenance",
        "changed_by": "Test User",
        "note": "Assigning device for testing"
    })

    # Get device status log
    response = client.get(f"/devices/{device_id}/status-log")
    assert response.status_code == 200
    data = response.json()
    print("Status Log Data:", data)  # Debug print to inspect the returned data
    assert isinstance(data, list)
    assert len(data) > 0
    for log_entry in data:
        assert "log_id" in log_entry
        assert log_entry["device_id"] == device_id
        assert "from_status" in log_entry
        assert log_entry["from_status"] in ["available", "maintenance", "in_repair", "retired"]
        assert log_entry["to_status"] in ["available", "maintenance", "in_repair", "retired"]
        assert log_entry["changed_by"] == "Test User"
        assert "changed_at" in log_entry