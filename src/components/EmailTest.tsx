'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Mail } from "lucide-react";

const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export function EmailModal() {
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        to: '',
        subject: '',
        html: ''
    });
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!isValidEmail(formData.to)) {
            toast.error('Please enter a valid email address');
            return;
        }
        
        if (!formData.subject.trim()) {
            toast.error('Please enter a subject');
            return;
        }
        
        if (!formData.html.trim()) {
            toast.error('Please enter a message');
            return;
        }
        
        setLoading(true);
        
        try {
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to send email');
            }
            
            toast.success('Email sent successfully!');
            setFormData({ to: '', subject: '', html: '' });
            setOpen(false);
        } catch (error) {
            console.error('Error sending email:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to send email');
        } finally {
            setLoading(false);
        }
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="bg-secondary hover:bg-tertiary">
                    <Mail className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-secondary text-primary">
                <DialogHeader>
                    <DialogTitle>Send Email</DialogTitle>
                    <DialogDescription>
                        Send an email to your team members or clients.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="to" className="text-sm font-medium">To:</label>
                        <Input
                            id="to"
                            name="to"
                            type="email"
                            required
                            value={formData.to}
                            onChange={handleChange}
                            placeholder="recipient@example.com"
                            className="col-span-3 bg-tertiary border-1 rounded-md"
                        />
                    </div>
            
                    <div className="space-y-2">
                        <label htmlFor="subject" className="text-sm font-medium">Subject:</label>
                        <Input
                            id="subject"
                            name="subject"
                            required
                            value={formData.subject}
                            onChange={handleChange}
                            placeholder="Email subject"
                            className="col-span-3 bg-tertiary border-1 rounded-md"
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label htmlFor="html" className="text-sm font-medium">Message:</label>
                        <Textarea
                            id="html"
                            name="html"
                            required
                            value={formData.html}
                            onChange={handleChange}
                            placeholder="Enter your message (HTML supported)"
                            className="col-span-3 bg-tertiary border-1 rounded-md"
                            rows={5}
                        />
                    </div>
                    
                    <div className="flex flex-row items-center justify-between space-x-2 pt-4">
                        <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Sending...' : 'Send Email'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
} 