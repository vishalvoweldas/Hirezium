'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Settings as SettingsIcon, User, Bell, Lock, Trash2, AlertTriangle, X } from 'lucide-react'

export default function CandidateSettingsPage() {
    const router = useRouter()
    const [emailNotifications, setEmailNotifications] = useState(true)
    const [jobAlerts, setJobAlerts] = useState(true)
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [deleteConfirmText, setDeleteConfirmText] = useState('')
    const [isDeleting, setIsDeleting] = useState(false)

    const handlePasswordChange = async () => {
        if (newPassword !== confirmPassword) {
            alert('Passwords do not match')
            return
        }

        // TODO: Implement password change API call
        alert('Password change functionality coming soon!')
    }

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== 'DELETE') return

        setIsDeleting(true)
        try {
            const token = localStorage.getItem('token')
            const res = await fetch('/api/auth/delete-account', {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (res.ok) {
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                router.push('/')
            } else {
                const data = await res.json()
                alert(data.error || 'Failed to delete account. Please try again.')
            }
        } catch (error) {
            console.error('Delete account error:', error)
            alert('Something went wrong. Please try again.')
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className="min-h-screen py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="content-container">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-heading font-bold text-primary-dark mb-2">
                            Settings
                        </h1>
                        <p className="text-secondary-dark">
                            Manage your account settings and preferences
                        </p>
                    </div>

                    {/* Account Information */}
                    <Card className="card-modern mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-primary-dark">
                                <User className="w-5 h-5" />
                                Account Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-secondary-dark">
                                To update your personal information, please visit your{' '}
                                <a href="/candidate/profile" className="text-blue-600 hover:underline">
                                    profile page
                                </a>.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Notification Preferences */}
                    <Card className="card-modern mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-primary-dark">
                                <Bell className="w-5 h-5" />
                                Notification Preferences
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-base font-medium text-primary-dark">
                                        Email Notifications
                                    </Label>
                                    <p className="text-sm text-secondary-dark">
                                        Receive updates about your applications
                                    </p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={emailNotifications}
                                    onChange={(e) => setEmailNotifications(e.target.checked)}
                                    className="w-5 h-5 text-blue-600 rounded"
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-base font-medium text-primary-dark">
                                        Job Alerts
                                    </Label>
                                    <p className="text-sm text-secondary-dark">
                                        Get notified about new job postings
                                    </p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={jobAlerts}
                                    onChange={(e) => setJobAlerts(e.target.checked)}
                                    className="w-5 h-5 text-blue-600 rounded"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Change Password */}
                    <Card className="card-modern mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-primary-dark">
                                <Lock className="w-5 h-5" />
                                Change Password
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="current-password">Current Password</Label>
                                <Input
                                    id="current-password"
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="Enter current password"
                                />
                            </div>
                            <div>
                                <Label htmlFor="new-password">New Password</Label>
                                <Input
                                    id="new-password"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password"
                                />
                            </div>
                            <div>
                                <Label htmlFor="confirm-password">Confirm New Password</Label>
                                <Input
                                    id="confirm-password"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                />
                            </div>
                            <Button onClick={handlePasswordChange} className="btn-primary">
                                Update Password
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Danger Zone */}
                    <Card className="card-modern border-red-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-red-600">
                                <Trash2 className="w-5 h-5" />
                                Danger Zone
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-secondary-dark mb-4">
                                Once you delete your account, there is no going back. Please be certain.
                            </p>
                            <Button
                                variant="destructive"
                                onClick={() => setShowDeleteDialog(true)}
                            >
                                Delete Account
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            {showDeleteDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2 text-red-600">
                                <AlertTriangle className="w-5 h-5" />
                                <h3 className="text-lg font-semibold">Delete Account</h3>
                            </div>
                            <button
                                onClick={() => {
                                    setShowDeleteDialog(false)
                                    setDeleteConfirmText('')
                                }}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-3">
                                This action <strong>cannot be undone</strong>. This will permanently delete your
                                account, profile, applications, and all associated data.
                            </p>
                            <p className="text-sm text-gray-600 mb-2">
                                Please type <strong className="text-red-600">DELETE</strong> to confirm.
                            </p>
                            <Input
                                value={deleteConfirmText}
                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                                placeholder="Type DELETE to confirm"
                                className="border-red-200 focus:border-red-400"
                            />
                        </div>

                        <div className="flex gap-3 justify-end">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowDeleteDialog(false)
                                    setDeleteConfirmText('')
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDeleteAccount}
                                disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                            >
                                {isDeleting ? 'Deleting...' : 'Delete My Account'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
