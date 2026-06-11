def test_get_statuses(client):
    response = client.get("/statuses/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    for status in data:
        assert "status" in status
        assert "label" in status
        assert "color" in status
        assert "description" in status
        assert "is_terminal" in status


def test_get_transitions(client):
    response = client.get("/statuses/available/transitions")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    for transition in data:
        assert "from_status" in transition
        assert "to_status" in transition
        assert "label" in transition
        assert "description" in transition
        assert "requires_return" in transition
