import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Button,
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge
} from './ui-consolidated';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';

const OfferSkillSection = () => {
  const { user, updateUser } = useAuth();
  const [showAddSkillModal, setShowAddSkillModal] = useState(false);
  const [newSkill, setNewSkill] = useState({
    skillName: '',
    category: '',
    level: '',
    description: '',
    hourlyRate: '',
    availability: ''
  });

  const skillCategories = [
    'Technology',
    'Design', 
    'Business',
    'Language',
    'Art',
    'Music',
    'Sports',
    'Cooking',
    'Writing',
    'Photography',
    'Marketing',
    'Finance',
    'Health & Fitness',
    'Education',
    'Other'
  ];

  const skillLevels = [
    'Beginner',
    'Intermediate', 
    'Advanced',
    'Expert'
  ];

  const availabilityOptions = [
    'Weekdays',
    'Weekends',
    'Evenings',
    'Flexible',
    'By Appointment'
  ];

  const handleInputChange = (field, value) => {
    setNewSkill(prev => ({ ...prev, [field]: value }));
  };

  const addSkill = () => {
    if (!newSkill.skillName || !newSkill.category || !newSkill.level) {
      toast.error('Please fill in all required fields');
      return;
    }

    const skill = {
      id: Date.now().toString(),
      ...newSkill,
      endorsed: false,
      createdAt: new Date().toISOString()
    };

    const updatedSkillsOffered = [...(user?.skillsOffered || []), skill];
    
    updateUser({
      skillsOffered: updatedSkillsOffered
    });

    setNewSkill({
      skillName: '',
      category: '',
      level: '',
      description: '',
      hourlyRate: '',
      availability: ''
    });
    
    setShowAddSkillModal(false);
    toast.success('Skill added successfully!');
  };

  const removeSkill = (skillId) => {
    const updatedSkillsOffered = user?.skillsOffered?.filter(skill => skill.id !== skillId) || [];
    updateUser({
      skillsOffered: updatedSkillsOffered
    });
    toast.success('Skill removed');
  };

  return (
    <>
      {/* Main Offer Skill Section */}
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Offer a Skill</CardTitle>
          <p className="text-muted-foreground">Share your expertise with others</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Skills */}
          {user?.skillsOffered && user.skillsOffered.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Your Skills</h3>
              <div className="grid gap-4">
                {user.skillsOffered.map((skill) => (
                  <Card key={skill.id} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold text-lg">{skill.skillName}</h4>
                            <Badge variant="secondary">{skill.level}</Badge>
                            <Badge variant="outline">{skill.category}</Badge>
                          </div>
                          {skill.description && (
                            <p className="text-muted-foreground mb-2">{skill.description}</p>
                          )}
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            {skill.hourlyRate && (
                              <span>Rate: ${skill.hourlyRate}/hour</span>
                            )}
                            {skill.availability && (
                              <span>Available: {skill.availability}</span>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSkill(skill.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Add Skill Button */}
          <Button 
            onClick={() => setShowAddSkillModal(true)}
            className="w-full h-16 border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-700"
            variant="outline"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Skill
          </Button>
        </CardContent>
      </Card>

      {/* Add Skill Modal */}
      <Dialog open={showAddSkillModal} onOpenChange={setShowAddSkillModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Add a New Skill</DialogTitle>
          </DialogHeader>
          
          <div className="overflow-y-auto max-h-[60vh] space-y-6 pr-2">
            {/* Skill Name */}
            <div>
              <Label htmlFor="skillName" className="text-sm font-medium">
                Skill Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="skillName"
                placeholder="e.g., React Development, Guitar Lessons, Photography"
                value={newSkill.skillName}
                onChange={(e) => handleInputChange('skillName', e.target.value)}
                className="mt-1"
              />
            </div>

            {/* Category and Level */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category" className="text-sm font-medium">
                  Category <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={newSkill.category}
                  onValueChange={(value) => handleInputChange('category', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {skillCategories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="level" className="text-sm font-medium">
                  Your Level <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={newSkill.level}
                  onValueChange={(value) => handleInputChange('level', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select your level" />
                  </SelectTrigger>
                  <SelectContent>
                    {skillLevels.map(level => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Describe your experience and what you can teach..."
                value={newSkill.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="mt-1"
              />
            </div>

            {/* Hourly Rate and Availability */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hourlyRate" className="text-sm font-medium">
                  Hourly Rate (USD)
                </Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  placeholder="25"
                  value={newSkill.hourlyRate}
                  onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="availability" className="text-sm font-medium">
                  Availability
                </Label>
                <Select
                  value={newSkill.availability}
                  onValueChange={(value) => handleInputChange('availability', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="When are you available?" />
                  </SelectTrigger>
                  <SelectContent>
                    {availabilityOptions.map(option => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => setShowAddSkillModal(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={addSkill}
              disabled={!newSkill.skillName || !newSkill.category || !newSkill.level}
            >
              Add Skill
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OfferSkillSection;
