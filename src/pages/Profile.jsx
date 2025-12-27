import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useUserManagement } from '../hooks/useUserManagement';
import { User, Shield, MapPin, Phone, Lock, Save, Edit2, CheckCircle, XCircle } from 'lucide-react';
import clsx from 'clsx';

const Profile = () => {
    const { user } = useUser();
    const { users, currentUserProfile, updateUser, updateUserRole } = useUserManagement();
    const [activeTab, setActiveTab] = useState('my-profile');
    const [isEditing, setIsEditing] = useState(false);

    // Form State for My Profile
    const [formData, setFormData] = useState({
        address: '',
        phone: ''
    });

    // Sync form data when profile loads
    useEffect(() => {
        if (currentUserProfile) {
            setFormData({
                address: currentUserProfile.details.address || '',
                phone: currentUserProfile.details.phone || ''
            });
            // If admin, default to dashboard, else my profile
            if (currentUserProfile.role === 'Admin' && activeTab === 'my-profile' && !isEditing) {
                // Optional: Auto-switch logic could go here, but let's keep it manual for now
            }
        }
    }, [currentUserProfile]);

    const handleSaveProfile = (e) => {
        e.preventDefault();
        // Validation: Address is required
        if (!formData.address.trim()) {
            alert("Address is required.");
            return;
        }

        updateUser(currentUserProfile.userId, {
            details: { ...currentUserProfile.details, ...formData }
        });
        setIsEditing(false);
    };

    const togglePermission = (targetUserId, resource) => {
        // Find user
        const targetUser = users.find(u => u.userId === targetUserId);
        if (!targetUser) return;

        const currentPerm = targetUser.permissions[resource];
        // Toggle logic: If 'write', downgrade to 'read'. If 'read', upgrade to 'write'.
        // Assuming 'read' is the baseline for all active users.
        const newPerm = currentPerm === 'write' ? 'read' : 'write';

        updateUser(targetUserId, {
            permissions: { ...targetUser.permissions, [resource]: newPerm }
        });
    };

    if (!currentUserProfile) return <div className="p-8 flex justify-center text-gray-500">Loading profile configuration...</div>;

    const isAdmin = currentUserProfile.role === 'Admin';

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-12">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Profile & Settings</h1>
                <span className={clsx(
                    "px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide uppercase",
                    isAdmin ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                )}>
                    {currentUserProfile.role} Portal
                </span>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('my-profile')}
                        className={clsx(
                            "whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 flex items-center",
                            activeTab === 'my-profile'
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        )}
                    >
                        <User size={18} className="mr-2" />
                        My Profile
                    </button>
                    {isAdmin && (
                        <button
                            onClick={() => setActiveTab('admin-dashboard')}
                            className={clsx(
                                "whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 flex items-center",
                                activeTab === 'admin-dashboard'
                                    ? "border-purple-500 text-purple-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            )}
                        >
                            <Shield size={18} className="mr-2" />
                            Admin Dashboard
                        </button>
                    )}
                </nav>
            </div>

            {/* Content: My Profile */}
            {activeTab === 'my-profile' && (
                <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl overflow-hidden md:flex">
                    <div className="p-8 md:w-1/3 bg-gray-50 border-r border-gray-100/50 flex flex-col items-center text-center">
                        <div className="relative">
                            <img
                                src={user?.imageUrl}
                                alt="Profile"
                                className="h-32 w-32 rounded-full border-4 border-white shadow-lg"
                            />
                            <div className="absolute bottom-0 right-0 bg-green-400 h-5 w-5 rounded-full border-2 border-white"></div>
                        </div>
                        <h2 className="mt-4 text-xl font-bold text-gray-900">{user?.fullName}</h2>
                        <p className="text-sm text-gray-500">{user?.primaryEmailAddress?.emailAddress}</p>

                        <div className="mt-6 w-full space-y-3">
                            <div className="flex justify-between items-center text-sm text-gray-600 bg-white p-3 rounded-lg shadow-sm">
                                <span>Role</span>
                                <span className={clsx("font-medium", isAdmin ? "text-purple-600" : "text-blue-600")}>{currentUserProfile.role}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm text-gray-600 bg-white p-3 rounded-lg shadow-sm">
                                <span>Status</span>
                                <span className="font-medium text-green-600">Active</span>
                            </div>
                        </div>

                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="mt-8 w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-all"
                            >
                                <Edit2 size={16} className="mr-2" />
                                Edit Contact Details
                            </button>
                        )}
                    </div>

                    <div className="p-8 md:w-2/3">
                        <div className="mb-6">
                            <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
                            <p className="mt-1 text-sm text-gray-500">Used for dispatch and emergency contact.</p>
                        </div>

                        <form onSubmit={handleSaveProfile} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Full Address <span className="text-red-500">*</span>
                                    </label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <MapPin className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            disabled={!isEditing}
                                            value={formData.address}
                                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                                            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg disabled:bg-gray-50 disabled:text-gray-500 py-2.5 transition-colors"
                                            placeholder="123 Main St, City, Country"
                                        />
                                    </div>
                                    {isEditing && !formData.address && <p className="mt-1 text-xs text-red-500">Address is required.</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Phone Number <span className="text-gray-400">(Optional)</span>
                                    </label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Phone className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            disabled={!isEditing}
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg disabled:bg-gray-50 disabled:text-gray-500 py-2.5 transition-colors"
                                            placeholder="+1 (555) 000-0000"
                                        />
                                    </div>
                                </div>
                            </div>

                            {isEditing && (
                                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                                    >
                                        <Save size={16} className="mr-2" />
                                        Save Changes
                                    </button>
                                </div>
                            )}
                        </form>

                        <div className="mt-10">
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Effective Permissions</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {Object.entries(currentUserProfile.permissions).map(([resource, access]) => (
                                    <div key={resource} className="bg-gray-50 p-4 rounded-lg border border-gray-200/60 flex items-center justify-between">
                                        <span className="text-gray-700 font-medium capitalize flex items-center">
                                            {resource === 'equipment' && <Shield size={14} className="mr-2 text-gray-400" />}
                                            {resource === 'requests' && <Edit2 size={14} className="mr-2 text-gray-400" />}
                                            {resource === 'users' && <User size={14} className="mr-2 text-gray-400" />}
                                            {resource}
                                        </span>
                                        <span className={clsx(
                                            "px-2.5 py-0.5 text-xs font-bold rounded-full uppercase tracking-wide",
                                            access === 'write' ? "bg-emerald-100 text-emerald-800" : "bg-gray-200 text-gray-600"
                                        )}>
                                            {access}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Content: Admin Dashboard */}
            {activeTab === 'admin-dashboard' && isAdmin && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-200">
                            <div className="px-6 py-6">
                                <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                                <dd className="mt-2 text-4xl font-extrabold text-gray-900">{users.length}</dd>
                            </div>
                        </div>
                        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-purple-100 bg-purple-50/30">
                            <div className="px-6 py-6">
                                <dt className="text-sm font-medium text-purple-600 truncate">Administrators</dt>
                                <dd className="mt-2 text-4xl font-extrabold text-purple-700">{users.filter(u => u.role === 'Admin').length}</dd>
                            </div>
                        </div>
                        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-blue-100 bg-blue-50/30">
                            <div className="px-6 py-6">
                                <dt className="text-sm font-medium text-blue-600 truncate">Technicians</dt>
                                <dd className="mt-2 text-4xl font-extrabold text-blue-700">{users.filter(u => u.role === 'Technician').length}</dd>
                            </div>
                        </div>
                    </div>

                    {/* Permission Management Table */}
                    <div className="bg-white shadow-lg shadow-gray-200/50 rounded-xl overflow-hidden border border-gray-200">
                        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between">
                            <div>
                                <h3 className="text-lg leading-6 font-bold text-gray-900">Permission Management</h3>
                                <p className="mt-1 text-sm text-gray-500">Control granular read/write access for each system module.</p>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User Identity</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Module Access (Read/Write)</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.map((u) => (
                                        <tr key={u.userId} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className={clsx(
                                                        "flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm",
                                                        u.role === 'Admin' ? "bg-purple-600" : "bg-blue-600"
                                                    )}>
                                                        {u.userId.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{u.userId}</div>
                                                        <div className="flex items-center mt-1">
                                                            {u.details?.address ? (
                                                                <span className="inline-flex items-center text-xs text-green-600">
                                                                    <CheckCircle size={10} className="mr-1" /> Profile Complete
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center text-xs text-amber-500">
                                                                    <XCircle size={10} className="mr-1" /> Profile Incomplete
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <select
                                                    value={u.role}
                                                    onChange={(e) => updateUserRole(u.userId, e.target.value)}
                                                    className={clsx(
                                                        "block w-full pl-3 pr-10 py-1.5 text-xs font-medium border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md shadow-sm transition-colors cursor-pointer",
                                                        u.role === 'Admin' ? "text-purple-700 bg-purple-50 border-purple-200" : "text-blue-700 bg-blue-50 border-blue-200"
                                                    )}
                                                    disabled={u.userId === currentUserProfile.userId}
                                                    title={u.userId === currentUserProfile.userId ? "You cannot change your own role" : "Change User Role"}
                                                >
                                                    <option value="Admin">Admin</option>
                                                    <option value="Technician">Technician</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-3">
                                                    {[
                                                        { key: 'equipment', label: 'Equipment', icon: Shield },
                                                        { key: 'requests', label: 'Requests', icon: Edit2 },
                                                        { key: 'users', label: 'Technicians', icon: User }
                                                    ].map(resource => (
                                                        <button
                                                            key={resource.key}
                                                            onClick={() => togglePermission(u.userId, resource.key)}
                                                            className={clsx(
                                                                "group relative inline-flex items-center px-3 py-1.5 rounded-lg border text-xs font-medium transition-all duration-200",
                                                                u.permissions[resource.key] === 'write'
                                                                    ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100 shadow-sm"
                                                                    : "bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100 hover:text-gray-600 opacity-80"
                                                            )}
                                                            title={`Toggle ${resource.label} Permission`}
                                                        >
                                                            <resource.icon size={12} className={clsx(
                                                                "mr-1.5 transition-colors",
                                                                u.permissions[resource.key] === 'write' ? "text-green-600" : "text-gray-400 group-hover:text-gray-500"
                                                            )} />
                                                            {resource.label}
                                                            <div className={clsx(
                                                                "ml-2 h-2 w-2 rounded-full",
                                                                u.permissions[resource.key] === 'write' ? "bg-green-500" : "bg-gray-300"
                                                            )} />
                                                        </button>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
