import React, { useState, useMemo } from 'react';
import { useRequests } from '../hooks/useRequests';
import { useEquipment } from '../hooks/useEquipment';
import { useTechnicians } from '../hooks/useTechnicians';
import RequestFormModal from '../components/RequestFormModal';
import ResolveModal from '../components/ResolveModal';
import { Plus, AlertCircle, CheckCircle, Clock, PlayCircle, Calendar, Layout, Trash2, List, Filter } from 'lucide-react';
import clsx from 'clsx';
import { useSearchParams } from 'react-router-dom';
import { useUserManagement } from '../hooks/useUserManagement';

const Requests = () => {
    const { requests, addRequest, updateRequestStage, updateRequest, isOverdue } = useRequests();
    const { equipment, updateEquipment } = useEquipment();
    const { technicians, teams } = useTechnicians();
    const { hasPermission } = useUserManagement();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [resolveModalOpen, setResolveModalOpen] = useState(false);
    const [resolvingRequestId, setResolvingRequestId] = useState(null);
    const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'calendar' | 'list'
    const [technicianFilter, setTechnicianFilter] = useState('');
    const [editingRequest, setEditingRequest] = useState(null);

    const [searchParams] = useSearchParams();
    const filterEquipmentId = searchParams.get('equipmentId');

    const getEquipmentName = (id) => equipment.find(a => a.id === id)?.name || 'Unknown Equipment';
    const getTechName = (id) => technicians.find(t => t.id === id)?.name || 'Unassigned';
    const getTechAvatar = (id) => {
        const name = getTechName(id);
        return name.split(' ').map(n => n[0]).join('').slice(0, 2);
    }

    const filteredRequests = useMemo(() => {
        let result = requests;
        if (filterEquipmentId) {
            result = result.filter(r => r.equipmentId === filterEquipmentId);
        }
        if (technicianFilter) {
            result = result.filter(r => r.assignedTo === technicianFilter);
        }
        return result;
    }, [requests, filterEquipmentId, technicianFilter]);

    const technicianStats = useMemo(() => {
        if (!technicianFilter) return null;
        const techRequests = requests.filter(r => r.assignedTo === technicianFilter);
        return {
            pending: techRequests.filter(r => r.stage === 'New' || r.stage === 'In Progress').length,
            completed: techRequests.filter(r => r.stage === 'Repaired').length,
            scrap: techRequests.filter(r => r.stage === 'Scrap').length,
        };
    }, [requests, technicianFilter]);

    const columns = [
        { title: 'New', stage: 'New', icon: AlertCircle, color: 'text-gray-500', bg: 'bg-gray-50' },
        { title: 'In Progress', stage: 'In Progress', icon: PlayCircle, color: 'text-blue-500', bg: 'bg-blue-50' },
        { title: 'Repaired', stage: 'Repaired', icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
        { title: 'Scrap', stage: 'Scrap', icon: Trash2, color: 'text-red-500', bg: 'bg-red-50' },
    ];

    const handleDragStart = (e, requestId) => {
        e.dataTransfer.setData('requestId', requestId);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e, stage) => {
        e.preventDefault();
        const requestId = e.dataTransfer.getData('requestId');
        transitionStage(requestId, stage);
    };

    const transitionStage = (requestId, stage) => {
        if (stage === 'Repaired') {
            setResolvingRequestId(requestId);
            setResolveModalOpen(true);
        } else if (stage === 'Scrap') {
            if (window.confirm("Moving this to Scrap will flag the equipment as unusable. Continue?")) {
                updateRequestStage(requestId, stage);
                const req = requests.find(r => r.id === requestId);
                if (req) {
                    updateEquipment(req.equipmentId, { isScrapped: true, status: 'Down' });
                }
            }
        } else {
            updateRequestStage(requestId, stage);
        }
    }

    const handleResolveSubmit = (duration) => {
        if (resolvingRequestId) {
            updateRequest(resolvingRequestId, { stage: 'Repaired', duration });
            setResolvingRequestId(null);
        }
    };

    const handleCreate = () => {
        setEditingRequest(null);
        setIsModalOpen(true);
    };

    const handleEdit = (req) => {
        setEditingRequest(req);
        setIsModalOpen(true);
    };

    const handleRequestSubmit = (data) => {
        if (editingRequest) {
            updateRequest(editingRequest.id, data);
        } else {
            addRequest(data);
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-4">
                    <h1 className="text-2xl font-bold">Maintenance Requests</h1>
                    <div className="flex bg-gray-200 rounded-lg p-1">
                        <button onClick={() => setViewMode('kanban')} title="Kanban Board" className={clsx("p-2 rounded-md", viewMode === 'kanban' ? 'bg-white shadow' : 'text-gray-600 hover:bg-gray-300')}><Layout size={20} /></button>
                        <button onClick={() => setViewMode('list')} title="List View" className={clsx("p-2 rounded-md", viewMode === 'list' ? 'bg-white shadow' : 'text-gray-600 hover:bg-gray-300')}><List size={20} /></button>
                        <button onClick={() => setViewMode('calendar')} title="Calendar View" className={clsx("p-2 rounded-md", viewMode === 'calendar' ? 'bg-white shadow' : 'text-gray-600 hover:bg-gray-300')}><Calendar size={20} /></button>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    {filterEquipmentId && (
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                            Eq: {getEquipmentName(filterEquipmentId)}
                        </span>
                    )}

                    <div className="relative">
                        <select
                            className="pl-8 pr-4 py-2 border rounded-md shadow-sm text-sm"
                            value={technicianFilter}
                            onChange={(e) => setTechnicianFilter(e.target.value)}
                        >
                            <option value="">All Technicians</option>
                            {technicians.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                        <Filter size={14} className="absolute left-2.5 top-3 text-gray-500" />
                    </div>

                    {hasPermission('requests', 'write') && (
                        <button
                            onClick={handleCreate}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            <Plus size={18} className="mr-2" />
                            New Request
                        </button>
                    )}
                </div>
            </div>

            {/* Technician Stats Header */}
            {technicianFilter && technicianStats && (
                <div className="bg-white p-4 rounded-lg shadow-sm border mb-4 flex space-x-6 animate-in slide-in-from-top-2">
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3 font-bold text-blue-600">
                            {getTechAvatar(technicianFilter)}
                        </div>
                        <div>
                            <p className="font-semibold">{getTechName(technicianFilter)}</p>
                            <p className="text-xs text-gray-500">Technician Stats</p>
                        </div>
                    </div>
                    <div className="h-10 w-px bg-gray-200"></div>
                    <div className="flex items-center space-x-6">
                        <div>
                            <span className="block text-xl font-bold text-orange-600">{technicianStats.pending}</span>
                            <span className="text-xs text-gray-500 uppercase">Pending</span>
                        </div>
                        <div>
                            <span className="block text-xl font-bold text-green-600">{technicianStats.completed}</span>
                            <span className="text-xs text-gray-500 uppercase">Completed</span>
                        </div>
                        <div>
                            <span className="block text-xl font-bold text-red-600">{technicianStats.scrap}</span>
                            <span className="text-xs text-gray-500 uppercase">Scrap</span>
                        </div>
                    </div>
                </div>
            )}

            {/* KANBAN VIEW */}
            {viewMode === 'kanban' && (
                <div className="flex-1 overflow-x-auto">
                    <div className="flex space-x-4 min-w-[1000px] h-full">
                        {columns.map((col) => (
                            <div
                                key={col.stage}
                                className={clsx("flex-1 rounded-lg p-4 flex flex-col", col.bg)}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, col.stage)}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center font-semibold text-gray-700">
                                        <col.icon size={20} className={clsx("mr-2", col.color)} />
                                        {col.title}
                                    </div>
                                    <span className="bg-white px-2 py-1 rounded text-xs font-bold shadow-sm">
                                        {filteredRequests.filter(r => r.stage === col.stage).length}
                                    </span>
                                </div>

                                <div className="flex-1 overflow-y-auto space-y-3">
                                    {filteredRequests.filter(r => r.stage === col.stage).map(req => (
                                        <div
                                            key={req.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, req.id)}
                                            onClick={() => handleEdit(req)}
                                            className={clsx(
                                                "bg-white p-3 rounded shadow-sm border py-2 cursor-move hover:shadow-md transition-shadow relative",
                                                isOverdue(req) ? "border-l-4 border-l-red-500" : "border-gray-100"
                                            )}
                                        >
                                            {isOverdue(req) && <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] px-1 rounded-bl">Overdue</span>}

                                            <div className="flex justify-between items-start mb-2">
                                                <span className={clsx("text-xs font-bold px-2 py-0.5 rounded",
                                                    req.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                                                        req.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                                                            req.priority === 'Medium' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                                )}>
                                                    {req.priority}
                                                </span>
                                                <span className="text-xs text-gray-400">{new Date(req.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <h4 className="font-semibold text-sm mb-1">{getEquipmentName(req.equipmentId)}</h4>
                                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{req.description}</p>
                                            <div className="text-xs text-gray-500 border-t pt-2 mt-2 flex justify-between items-center">
                                                <span className={clsx("text-[10px] px-1 rounded border", req.type === 'Preventive' ? 'border-purple-200 text-purple-600 bg-purple-50' : 'border-gray-200 text-gray-500 bg-gray-50')}>{req.type}</span>
                                                {req.assignedTo && (
                                                    <div className="flex items-center" title={getTechName(req.assignedTo)}>
                                                        <div className="w-6 h-6 bg-slate-700 text-white rounded-full flex items-center justify-center text-xs">
                                                            {getTechAvatar(req.assignedTo)}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* LIST VIEW */}
            {viewMode === 'list' && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipment</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Technician</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stage</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredRequests.map(req => (
                                <tr key={req.id} className={clsx("hover:bg-gray-50 cursor-pointer", isOverdue(req) && "bg-red-50")} onClick={() => handleEdit(req)}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={clsx("px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                                            req.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                                                req.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                                                    req.priority === 'Medium' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                        )}>
                                            {req.priority}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{getEquipmentName(req.equipmentId)}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{req.description}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getTechName(req.assignedTo)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={clsx("px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                                            req.stage === 'New' ? 'bg-gray-100 text-gray-800' :
                                                req.stage === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                                    req.stage === 'Repaired' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        )}>
                                            {req.stage}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={(e) => { e.stopPropagation(); transitionStage(req.id, 'Repaired'); }} className="text-green-600 hover:text-green-900 mr-2">Complete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* CALENDAR VIEW GRID */}
            {viewMode === 'calendar' && (
                <div className="bg-white rounded-lg shadow p-6 h-full flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">Maintenance Schedule</h2>
                        <div className="flex space-x-2">
                            <span className="flex items-center text-xs"><span className="w-3 h-3 rounded-full bg-blue-500 mr-1"></span> Preventive</span>
                            <span className="flex items-center text-xs"><span className="w-3 h-3 rounded-full bg-orange-500 mr-1"></span> Corrective</span>
                        </div>
                    </div>

                    {/* Calendar Grid Header */}
                    <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-t-lg">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="bg-gray-50 py-2 text-center text-xs font-semibold text-gray-500 uppercase">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid Body */}
                    <div className="grid grid-cols-7 gap-px bg-gray-200 border-x border-b border-gray-200 rounded-b-lg flex-1">
                        {Array.from({ length: 35 }).map((_, i) => {
                            const dayNum = i - 2;
                            const isValidDay = dayNum > 0 && dayNum <= 31;

                            const dailyRequests = isValidDay ? filteredRequests.filter(r => {
                                const d = r.scheduledDate ? new Date(r.scheduledDate) : new Date(r.createdAt);
                                return d.getDate() === dayNum;
                            }) : [];

                            return (
                                <div key={i} className={clsx("bg-white min-h-[100px] p-2 relative group", !isValidDay && "bg-gray-50")}>
                                    {isValidDay && (
                                        <>
                                            <span className={clsx("text-sm font-medium",
                                                new Date().getDate() === dayNum ? "bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center" : "text-gray-700"
                                            )}>
                                                {dayNum}
                                            </span>

                                            <div className="mt-1 space-y-1 overflow-y-auto max-h-[80px]">
                                                {dailyRequests.map(req => (
                                                    <div
                                                        key={req.id}
                                                        onClick={() => handleEdit(req)}
                                                        className={clsx(
                                                            "text-[10px] px-1 py-0.5 rounded truncate cursor-pointer hover:opacity-80 text-white",
                                                            req.type === 'Preventive' ? 'bg-blue-500' : 'bg-orange-500'
                                                        )}
                                                        title={`${getEquipmentName(req.equipmentId)}: ${req.description}`}
                                                    >
                                                        {getEquipmentName(req.equipmentId)}
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <RequestFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleRequestSubmit}
                initialData={editingRequest}
            />

            <ResolveModal
                isOpen={resolveModalOpen}
                onClose={() => setResolveModalOpen(false)}
                onSubmit={handleResolveSubmit}
            />
        </div>
    );
};

export default Requests;
