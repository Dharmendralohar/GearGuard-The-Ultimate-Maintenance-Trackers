import React, { useState } from 'react';
import { useEquipment } from '../hooks/useEquipment';
import { useRequests } from '../hooks/useRequests';
import EquipmentFormModal from '../components/EquipmentFormModal';
import { Plus, Edit2, Trash2, Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { useUserManagement } from '../hooks/useUserManagement';

const Equipment = () => {
    const { equipment, addEquipment, updateEquipment, deleteEquipment } = useEquipment();
    const { requests } = useRequests();
    const { hasPermission } = useUserManagement();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const navigate = useNavigate();

    const handleCreate = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleSubmit = (data) => {
        if (editingItem) {
            updateEquipment(editingItem.id, data);
        } else {
            addEquipment(data);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Operational': return 'bg-green-100 text-green-800';
            case 'Down': return 'bg-red-100 text-red-800';
            case 'Maintenance': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getOpenRequestsCount = (eqId) => {
        return requests.filter(r => r.equipmentId === eqId && r.stage !== 'Repaired' && r.stage !== 'Scrap').length;
    };

    const goToMaintenance = (eqId) => {
        navigate(`/requests?equipmentId=${eqId}`);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Equipment</h1>
                {hasPermission('equipment', 'write') && (
                    <button
                        onClick={handleCreate}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={18} className="mr-2" />
                        Add Equipment
                    </button>
                )}
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name / Serial</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Maintenance</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {equipment.map((item) => (
                            <tr key={item.id} className={clsx("hover:bg-gray-50", item.isScrapped && "bg-gray-100 opacity-60")}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div>
                                            <div className="font-medium text-gray-900">{item.name}</div>
                                            <div className="text-sm text-gray-500">{item.serialNumber}</div>
                                        </div>
                                        {item.isScrapped && (
                                            <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-600 text-white">SCRAP</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{item.department}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{item.location}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={clsx("px-2 inline-flex text-xs leading-5 font-semibold rounded-full", getStatusColor(item.status))}>
                                        {item.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <button
                                        onClick={() => goToMaintenance(item.id)}
                                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                                    >
                                        <Wrench size={12} className="mr-1" />
                                        Requests
                                        <span className="ml-2 bg-indigo-800 py-0.5 px-1.5 rounded-full text-xs">{getOpenRequestsCount(item.id)}</span>
                                    </button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {hasPermission('equipment', 'write') && (
                                        <>
                                            <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-900 mr-4">
                                                <Edit2 size={18} />
                                            </button>
                                            <button onClick={() => deleteEquipment(item.id)} className="text-red-600 hover:text-red-900">
                                                <Trash2 size={18} />
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {equipment.length === 0 && (
                            <tr>
                                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">No equipment found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <EquipmentFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                initialData={editingItem}
            />
        </div>
    );
};

export default Equipment;
