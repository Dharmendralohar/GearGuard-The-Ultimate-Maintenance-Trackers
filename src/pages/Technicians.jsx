import React, { useState } from 'react';
import { useTechnicians } from '../hooks/useTechnicians';
import { Plus, Trash2, User } from 'lucide-react';
import clsx from 'clsx';
import { useUserManagement } from '../hooks/useUserManagement';

const Technicians = () => {
    const { technicians, teams, addTechnician, deleteTechnician } = useTechnicians();
    const { hasPermission, provisionUser } = useUserManagement();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', role: 'Technician', teamId: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        addTechnician(formData);

        // Auto-provision user in Admin Dashboard
        if (formData.email) {
            provisionUser(formData.email, formData.name, 'Technician');
        }

        setIsFormOpen(false);
        setFormData({ name: '', email: '', role: 'Technician', teamId: '' });
    };

    const getTeamName = (id) => teams.find(t => t.id === id)?.name || 'Unassigned';

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Technicians</h1>
                {hasPermission('users', 'write') && (
                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={18} className="mr-2" />
                        Add Technician
                    </button>
                )}
            </div>

            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
                        <h2 className="text-xl font-bold mb-4">Add Technician</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <input
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email (for Login Access)</label>
                                <input
                                    type="email"
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Role</label>
                                <select
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="Technician">Technician</option>
                                    <option value="Manager">Manager</option>
                                    <option value="Specialist">Specialist</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Team</label>
                                <select
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    value={formData.teamId}
                                    onChange={e => setFormData({ ...formData, teamId: e.target.value })}
                                >
                                    <option value="">Select Team</option>
                                    {teams.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-end space-x-2 pt-4">
                                <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Add</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {technicians.map(tech => (
                    <div key={tech.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                                <User className="text-gray-500" size={24} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">{tech.name}</h3>
                                <p className="text-sm text-gray-500">{tech.role} • {getTeamName(tech.teamId)}</p>
                            </div>
                        </div>
                        {hasPermission('users', 'write') && (
                            <button onClick={() => deleteTechnician(tech.id)} className="text-red-500 hover:text-red-700 p-2">
                                <Trash2 size={18} />
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Technicians;
