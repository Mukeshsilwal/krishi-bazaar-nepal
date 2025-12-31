
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

const AdminRegisterPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        mobileNumber: '',
        password: '',
        adminSecret: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await api.post('/auth/admin/register', formData);
            if (res.data.success) {
                toast.success("Admin registered successfully! Please login.");
                navigate('/admin/login');
            }
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold text-primary">Admin Registration</CardTitle>
                    <CardDescription>Create a new administrator account</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                placeholder="Admin Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="mobileNumber">Mobile Number</Label>
                            <Input
                                id="mobileNumber"
                                placeholder="98XXXXXXXX"
                                value={formData.mobileNumber}
                                onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="********"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="adminSecret">Admin Secret Key</Label>
                            <Input
                                id="adminSecret"
                                type="password"
                                placeholder="Enter secret key to authorize"
                                value={formData.adminSecret}
                                onChange={(e) => setFormData({ ...formData, adminSecret: e.target.value })}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Registering..." : "Register Admin"}
                        </Button>
                        <div className="text-center text-sm">
                            <a href="/admin/login" className="text-primary hover:underline">
                                Back to Login
                            </a>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminRegisterPage;
