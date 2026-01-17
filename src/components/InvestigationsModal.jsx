import { useEffect, useState } from 'react';
import { Button, Table, Form, InputGroup } from 'react-bootstrap';
import { FiTrash2 } from 'react-icons/fi';
import api from '../utils/api';
import './InvestigationModal.css'

export default function InvestigationsModal({ show, onHide }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newTest, setNewTest] = useState({ test_name: '', units: '', today: '' });

  useEffect(() => {
    if (show) fetchItems();
  }, [show]);

  async function fetchItems() {
    setLoading(true);
    try {
      const res = await api.get('/investigations');
      setItems(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this test?')) return;
    try {
      await api.delete(`/investigations/${id}`);
      setItems((s) => s.filter((x) => x.id !== id));
    } catch (err) {
      console.error(err);
    }
  }

  function handleTodayChange(id, value) {
    setItems((s) => s.map((it) => (it.id === id ? { ...it, today: value } : it)));
  }

  async function handleTodayBlur(id, item) {
    try {
      await api.put(`/investigations/${id}`, { test_name: item.test_name, units: item.units, today: item.today });
    } catch (err) {
      console.error(err);
    }
  }

  async function handleAdd() {
    if (!newTest.test_name || newTest.test_name.trim() === '') return;
    setAdding(true);
    try {
      const res = await api.post('/investigations', { test_name: newTest.test_name.trim(), units: newTest.units || null, today: newTest.today || null });
      setItems((s) => [...s, res.data]);
      setNewTest({ test_name: '', units: '', today: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  }

  if (!show) return null;

  return (
    <div className="investigations-panel mb-3">
      <div style={{ overflowX: 'auto' }}>
        <Table bordered size="sm" className="test-table">
              <colgroup>
    <col style={{ width: "20px" }} />   {/* # */}
    <col style={{ width: "35%" }} />     {/* Tests */}
    <col style={{ width: "60px" }} />    {/* Units */}
    <col style={{ width: "60px" }} />   {/* Today */}
    <col style={{ width: "20px" }} />    {/* Action */}
  </colgroup>
          <thead>
            <tr>
              <th>#</th>
              <th>Tests / Investigations</th>
              <th>Units</th>
              <th>Today</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5}>Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={5}>No tests found</td></tr>
            ) : (
              items.map((it, idx) => (
                <tr key={it.id}>
                  <td>{idx + 1}</td>
                  <td>{it.test_name}</td>
                  <td>{it.units || ''}</td>
                  <td style={{ width: 160 }}>
                    <Form.Control
                      size="sm"
                      value={it.today || ''}
                      onChange={(e) => handleTodayChange(it.id, e.target.value)}
                      onBlur={() => handleTodayBlur(it.id, { ...it, today: items.find(x => x.id === it.id)?.today })}
                    />
                  </td>
                  <td className="text-center">
                    <Button variant="link" size="sm" className="text-danger p-0" onClick={() => handleDelete(it.id)}>
                      <FiTrash2 />
                    </Button>
                  </td>
                </tr>
              ))
            )}
            <tr>
              <td>#</td>
              <td>
                <InputGroup>
                  <Form.Control placeholder="Test name" size="sm" value={newTest.test_name} onChange={(e) => setNewTest((s) => ({ ...s, test_name: e.target.value }))} />
                </InputGroup>
              </td>
              <td>
                <Form.Control placeholder="Units" size="sm" value={newTest.units} onChange={(e) => setNewTest((s) => ({ ...s, units: e.target.value }))} />
              </td>
              <td>
                <Form.Control placeholder="Today" size="sm" value={newTest.today} onChange={(e) => setNewTest((s) => ({ ...s, today: e.target.value }))} />
              </td>
              <td>
                <Button size="sm" onClick={handleAdd} disabled={adding}>{adding ? 'Adding...' : '+ Test'}</Button>
              </td>
            </tr>
          </tbody>
        </Table>
      </div>
    </div>
  );
}
