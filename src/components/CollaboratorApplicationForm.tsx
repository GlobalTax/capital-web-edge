
import React, { useState } from 'react';
import { useCollaboratorApplications } from '@/hooks/useCollaboratorApplications';
import { useSimpleFormTracking } from '@/hooks/useSimpleFormTracking';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const CollaboratorApplicationForm = () => {
  const { submitApplication, isSubmitting } = useCollaboratorApplications();
  
  const { trackFormSubmission } = useSimpleFormTracking();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    profession: '',
    experience: '',
    motivation: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await submitApplication(formData);
      trackFormSubmission('collaborator_application', formData);
      
      // Resetear formulario
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        company: '',
        profession: '',
        experience: '',
        motivation: '',
      });
    } catch (error) {
      console.error('Error enviando solicitud:', error);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Solicitud para el Programa de Colaboradores</CardTitle>
        <CardDescription>
          Completa este formulario para unirte a nuestro programa de colaboradores
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nombre Completo *</Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Tu nombre completo"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                placeholder="tu@email.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono *</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+34 123 456 789"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company">Empresa</Label>
              <Input
                id="company"
                name="company"
                type="text"
                value={formData.company}
                onChange={handleInputChange}
                placeholder="Nombre de tu empresa"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="profession">Profesión *</Label>
            <Input
              id="profession"
              name="profession"
              type="text"
              required
              value={formData.profession}
              onChange={handleInputChange}
              placeholder="Tu profesión o área de especialización"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Experiencia Relevante</Label>
            <Textarea
              id="experience"
              name="experience"
              value={formData.experience}
              onChange={handleInputChange}
              placeholder="Describe tu experiencia relevante en M&A, valoraciones, finanzas corporativas, etc."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="motivation">Motivación</Label>
            <Textarea
              id="motivation"
              name="motivation"
              value={formData.motivation}
              onChange={handleInputChange}
              placeholder="¿Por qué te interesa unirte a nuestro programa de colaboradores?"
              rows={3}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CollaboratorApplicationForm;
