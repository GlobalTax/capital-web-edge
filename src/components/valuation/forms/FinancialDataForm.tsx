
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check } from 'lucide-react';

interface FinancialDataFormProps {
  companyData: any;
  updateField: (field: string, value: string | number | boolean) => void;
  showValidation?: boolean;
}

const FinancialDataForm: React.FC<FinancialDataFormProps> = ({
  companyData,
  updateField,
  showValidation = false
}) => {
  const [touchedFields, setTouchedFields] = React.useState<Set<string>>(new Set());

  const handleBlur = (fieldName: string) => {
    setTouchedFields(prev => new Set(prev).add(fieldName));
  };

  const formatCurrency = (value: number): string => {
    if (!value || value === 0) return '';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const isFieldValid = (fieldName: string, minValue: number = 0): boolean => {
    const value = companyData[fieldName];
    return value !== undefined && value !== null && value > minValue;
  };

  const getFieldClassName = (fieldName: string, isRequired: boolean = true, minValue: number = 0) => {
    const isTouched = touchedFields.has(fieldName);
    const isValid = isFieldValid(fieldName, minValue);
    const hasValue = Boolean(companyData[fieldName]);
    
    if (!showValidation && !isTouched) {
      return "w-full border-0.5 border-black focus:ring-2 focus:ring-black/20 focus:border-black rounded-lg px-4 py-3";
    }
    
    if (isValid && hasValue && (isTouched || showValidation)) {
      return "w-full border-0.5 border-green-500 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 rounded-lg px-4 py-3 pr-10";
    } else if (!isValid && isRequired && (showValidation || (isTouched && !hasValue))) {
      return "w-full border-0.5 border-red-500 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 rounded-lg px-4 py-3";
    }
    
    return "w-full border-0.5 border-black focus:ring-2 focus:ring-black/20 focus:border-black rounded-lg px-4 py-3";
  };

  const shouldShowCheckIcon = (fieldName: string, minValue: number = 0) => {
    const isTouched = touchedFields.has(fieldName);
    const isValid = isFieldValid(fieldName, minValue);
    const hasValue = Boolean(companyData[fieldName]);
    return isValid && hasValue && (isTouched || showValidation);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Información Financiera</h2>
        <p className="text-gray-600">Datos del último ejercicio fiscal completo</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Facturación anual */}
        <div className="relative">
          <Label htmlFor="revenue" className="block text-sm font-medium text-gray-700 mb-2">
            Facturación anual *
          </Label>
          <Input
            id="revenue"
            name="revenue"
            type="number"
            min="0"
            step="1000"
            value={companyData.revenue || ''}
            onChange={(e) => updateField('revenue', parseFloat(e.target.value) || 0)}
            onBlur={() => handleBlur('revenue')}
            placeholder="500000"
            className={getFieldClassName('revenue', true, 0)}
          />
          {shouldShowCheckIcon('revenue') && (
            <Check className="absolute right-3 top-10 h-4 w-4 text-green-500" />
          )}
          <p className="text-sm text-gray-500 mt-1">
            {companyData.revenue ? `Aprox. ${formatCurrency(companyData.revenue)}` : 'Ingresos totales del último año'}
          </p>
          {showValidation && !isFieldValid('revenue') && (
            <p className="text-red-500 text-sm mt-1">Este campo es obligatorio</p>
          )}
        </div>

        {/* EBITDA */}
        <div className="relative">
          <Label htmlFor="ebitda" className="block text-sm font-medium text-gray-700 mb-2">
            EBITDA *
          </Label>
          <Input
            id="ebitda"
            name="ebitda"
            type="number"
            step="1000"
            value={companyData.ebitda || ''}
            onChange={(e) => updateField('ebitda', parseFloat(e.target.value) || 0)}
            onBlur={() => handleBlur('ebitda')}
            placeholder="100000"
            className={getFieldClassName('ebitda')}
          />
          {shouldShowCheckIcon('ebitda') && (
            <Check className="absolute right-3 top-10 h-4 w-4 text-green-500" />
          )}
          <p className="text-sm text-gray-500 mt-1">
            {companyData.ebitda ? `Aprox. ${formatCurrency(companyData.ebitda)}` : 'Beneficio antes de intereses, impuestos, depreciación y amortización'}
          </p>
          {showValidation && !isFieldValid('ebitda') && (
            <p className="text-red-500 text-sm mt-1">Este campo es obligatorio</p>
          )}
        </div>

        {/* ¿Tienes ajustes? */}
        <div className="col-span-1 md:col-span-2">
          <Label className="block text-sm font-medium text-gray-700 mb-3">
            ¿Tienes ajustes al EBITDA?
          </Label>
          <div className="flex gap-4 mb-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="hasAdjustments"
                value="false"
                checked={!companyData.hasAdjustments}
                onChange={() => {
                  updateField('hasAdjustments', false);
                  updateField('adjustmentAmount', 0);
                  handleBlur('hasAdjustments');
                }}
                className="mr-2"
              />
              No
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="hasAdjustments"
                value="true"
                checked={companyData.hasAdjustments}
                onChange={() => {
                  updateField('hasAdjustments', true);
                  handleBlur('hasAdjustments');
                }}
                className="mr-2"
              />
              Sí
            </label>
          </div>
          
          {companyData.hasAdjustments && (
            <div className="relative">
              <Label htmlFor="adjustmentAmount" className="block text-sm font-medium text-gray-700 mb-2">
                Importe del ajuste (€)
              </Label>
              <Input
                id="adjustmentAmount"
                name="adjustmentAmount"
                type="number"
                step="1000"
                value={companyData.adjustmentAmount || ''}
                onChange={(e) => updateField('adjustmentAmount', parseFloat(e.target.value) || 0)}
                onBlur={() => handleBlur('adjustmentAmount')}
                placeholder="50000"
                className={getFieldClassName('adjustmentAmount', false)}
              />
              {shouldShowCheckIcon('adjustmentAmount') && (
                <Check className="absolute right-3 top-10 h-4 w-4 text-green-500" />
              )}
              <p className="text-sm text-gray-500 mt-1">
                {companyData.adjustmentAmount ? `Aprox. ${formatCurrency(companyData.adjustmentAmount)}` : 'Importe a añadir o sustraer del EBITDA'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Información adicional */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">
          ¿Necesita ayuda con estos datos?
        </h3>
        <p className="text-sm text-blue-700">
          Si no dispone de algunos de estos datos, nuestro equipo puede ayudarle a obtenerlos 
          de sus estados financieros. La precisión de estos datos es crucial para una valoración exacta.
        </p>
      </div>
    </div>
  );
};

export default FinancialDataForm;
