'use client';

import React, { useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useQueryState, parseAsBoolean } from 'nuqs';
import { User } from '../types';
import { Checkbox } from '@/components/ui/checkbox';

interface CreateConversationProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateConversation: (name: string, memberIds: string[]) => Promise<void>;
  availableMembers: User[];
  isLoading?: boolean;
}

export function CreateConversation({
  isOpen,
  onClose,
  onCreateConversation,
  availableMembers = [],
  isLoading = false
}: CreateConversationProps) {
  const [name, setName] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [userEditedName, setUserEditedName] = useState(false);

  const safeAvailableMembers = Array.isArray(availableMembers) ? availableMembers : [];
  
  // Automatically update name suggestion based on selected members
  // But only if user hasn't manually edited the name
  React.useEffect(() => {
    if (userEditedName) return;
    
    if (selectedMemberIds.length === 1) {
      const selectedMember = safeAvailableMembers.find(m => m.id === selectedMemberIds[0]);
      if (selectedMember) {
        setName(selectedMember.name);
      }
    } else if (selectedMemberIds.length > 1) {
      setName(`Group Chat (${selectedMemberIds.length} members)`);
    }
  }, [selectedMemberIds, safeAvailableMembers, userEditedName]);

  // Reset form when dialog opens or closes
  React.useEffect(() => {
    if (!isOpen) {
      handleReset();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Please enter a conversation name');
      return;
    }
    
    if (selectedMemberIds.length === 0) {
      setError('Please select at least one member');
      return;
    }
    
    try {
      await onCreateConversation(name.trim(), selectedMemberIds);
      handleReset();
      onClose();
    } catch (err) {
      setError('Failed to create conversation. Please try again.');
    }
  };
  
  const handleReset = () => {
    setName('');
    setSelectedMemberIds([]);
    setError(null);
    setUserEditedName(false);
  };
  
  const toggleMember = (memberId: string) => {
    setSelectedMemberIds(prev => {
      const newSelection = prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId];
      
      // If all members are deselected, clear the conversation name
      // unless the user has edited it manually
      if (newSelection.length === 0 && !userEditedName) {
        setName('');
      }
      
      return newSelection;
    });
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    setUserEditedName(true);
  };
  
  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) {
          handleReset();
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[425px] bg-secondary dark:bg-[#DFDFDF]">
        <DialogHeader>
          <DialogTitle className="text-primary dark:text-gray-800 font-semibold">Create New Conversation</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-primary dark:text-gray-800">Conversation Name</Label>
              <Input
                id="name"
                value={name}
                onChange={handleNameChange}
                placeholder="Enter conversation name"
                className="bg-tertiary dark:bg-white/50 border-1 text-primary dark:text-gray-800 placeholder:text-muted-foreground dark:placeholder:text-gray-500"
              />
            </div>
            
            <div className="grid gap-2">
              <Label className="text-primary dark:text-gray-800">Select Members</Label>
              <div className="border rounded-md p-3 max-h-[200px] overflow-y-auto bg-tertiary dark:bg-white/50">
                {safeAvailableMembers.length === 0 ? (
                  <div className="text-sm text-muted-foreground dark:text-gray-600">
                    No members available
                  </div>
                ) : (
                  safeAvailableMembers.map((member) => (
                    <div key={member.id} className="flex items-center space-x-2 mb-2">
                      <Checkbox
                        id={`member-${member.id}`}
                        checked={selectedMemberIds.includes(member.id)}
                        onCheckedChange={() => toggleMember(member.id)}
                        className="border-primary dark:border-gray-800"
                      />
                      <Label
                        htmlFor={`member-${member.id}`}
                        className="text-sm font-normal cursor-pointer text-primary dark:text-gray-800"
                      >
                        {member.name}
                      </Label>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {error && (
              <div className="text-sm text-red-500 bg-red-50 dark:bg-red-100 p-2 rounded">
                {error}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="bg-tertiary dark:bg-white/50 text-primary dark:text-gray-800 hover:bg-primary/10 dark:hover:bg-white/60"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-primary text-secondary hover:bg-primary/90 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
            >
              {isLoading ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 