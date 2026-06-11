def test_assign_device_to_employee(client):
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
    assert "assignment_id" in created_assignment
    assert "assigned_at" in created_assignment
    assert created_assignment["employee_id"] == employee_id
    assert created_assignment["device_id"] == device_id


def test_get_employee_assignment_history(client):
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

    # Now, retrieve the employee's assignment history
    response = client.get("/assignments")
    assert response.status_code == 200
    assignment_history = response.json()
    # Filter the assignment history for the specific employee
    assert isinstance(assignment_history, list)
    assert len(assignment_history) > 0
    for entry in assignment_history:
        assert "assignment_id" in entry
        assert "assigned_at" in entry
        assert "employee" in entry
        assert "device" in entry
        assert entry["employee"]["employee_id"] == employee_id
        assert entry["device"]["device_id"] == device_id


def test_get_active_assignment_for_device(client):
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

    # Now, retrieve the active assignment for the specific device
    response = client.get(f"/assignments/active/{device_id}")
    assert response.status_code == 200
    active_assignment = response.json()
    assert "assignment_id" in active_assignment
    assert "assigned_at" in active_assignment
    assert "returned_at" in active_assignment
    assert active_assignment["returned_at"] is None


def test_get_active_assignment_for_device_not_found(client):
    response = client.get(f"/assignments/active/99999")
    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "No active assignment found for device 99999."


def test_update_assignment_return_device(client):
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
    assignment_id = created_assignment["assignment_id"]

    # Now, retrieve the active assignment for the specific device
    response = client.patch(f"/assignments/{assignment_id}/return", json={
        
    })
    assert response.status_code == 200
    updated_assignment = response.json()
    assert "assignment_id" in updated_assignment
    assert "assigned_at" in updated_assignment
    assert "returned_at" in updated_assignment
    assert updated_assignment["assignment_id"] == assignment_id
    assert updated_assignment["returned_at"] is not None