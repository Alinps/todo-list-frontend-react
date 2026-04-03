import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const EditTaskModal = ({ show, onClose, task, onSave }) => {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDueDate(task.due_date ? task.due_date.split("T")[0] : "");
      setDueTime(task.due_time || "");
    } else {
      setTitle('');
      setDueDate('');
      setDueTime('');
    }
  }, [task]);

  // const handleSave = () => {
  //   if (!title.trim() || !dueDate) {
  //     alert('Both title and date are required!');
  //     return;
  //   }
  //   if (!task) return;
  //   onSave(task.id, { title, due_date: dueDate });
  //   onClose();
  // };
  const handleSave = () => {
  if (!title.trim() || !dueDate) {
    alert('Both title and date are required!');
    return;
  }
  if (!task) return;

  // send a merged object instead of (id, data)
  onSave({ ...task, title, due_date: dueDate, due_time: dueTime || null });
  onClose();
};

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Task</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Title</Form.Label>
            <Form.Control 
              type="text" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Due Date</Form.Label>
            <Form.Control 
              type="date" 
              value={dueDate} 
              onChange={e => setDueDate(e.target.value)} 
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Time</Form.Label>
            <Form.Control
              type="time"
              value={dueTime}
              onChange={e => setDueTime(e.target.value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={handleSave}>Save</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditTaskModal;
