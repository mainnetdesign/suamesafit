import React, { useState } from 'react';
import * as Button from '~/components/align-ui/ui/button';
import { RiArrowDownSLine, RiArrowUpSLine } from '@remixicon/react';

// Tipos para os dados nutricionais
export interface NutritionalInfo {
  porcao?: {
    tamanho: string;
    unidade: string;
  };
  valorEnergetico?: {
    quantidade: number;
    unidade: string;
    vd?: number;
  };
  carboidratos?: {
    quantidade: number;
    unidade: string;
    vd?: number;
  };
  acucares?: {
    quantidade: number;
    unidade: string;
    vd?: number;
  };
  proteinas?: {
    quantidade: number;
    unidade: string;
    vd?: number;
  };
  gordurasTotais?: {
    quantidade: number;
    unidade: string;
    vd?: number;
  };
  gordurasSaturadas?: {
    quantidade: number;
    unidade: string;
    vd?: number;
  };
  gordurasTrans?: {
    quantidade: number;
    unidade: string;
    vd?: number;
  };
  fibras?: {
    quantidade: number;
    unidade: string;
    vd?: number;
  };
  sodio?: {
    quantidade: number;
    unidade: string;
    vd?: number;
  };
  calcio?: {
    quantidade: number;
    unidade: string;
    vd?: number;
  };
  ferro?: {
    quantidade: number;
    unidade: string;
    vd?: number;
  };
  vitaminaA?: {
    quantidade: number;
    unidade: string;
    vd?: number;
  };
  vitaminaC?: {
    quantidade: number;
    unidade: string;
    vd?: number;
  };
  [key: string]: any; // Para permitir campos adicionais
}

interface NutritionalTableProps {
  nutritionalInfo?: NutritionalInfo | null;
  className?: string;
  selectedVariantIndex?: number | null;
  selectedVariantTitle?: string | null; // Mantemos para exibir o nome
}

// Configuração de campos e seus rótulos
const NUTRITIONAL_FIELDS = [
  {
    key: 'valorEnergetico',
    label: 'valor energético',
    required: true,
  },
  {
    key: 'carboidratos',
    label: 'carboidratos',
    required: true,
  },
  {
    key: 'acucares',
    label: 'açúcares',
    required: false,
  },
  {
    key: 'proteinas',
    label: 'proteínas',
    required: true,
  },
  {
    key: 'gordurasTotais',
    label: 'gorduras totais',
    required: true,
  },
  {
    key: 'gordurasSaturadas',
    label: 'gorduras saturadas',
    required: false,
  },
  {
    key: 'gordurasTrans',
    label: 'gorduras trans',
    required: false,
  },
  {
    key: 'fibras',
    label: 'fibras',
    required: true,
  },
  {
    key: 'sodio',
    label: 'sódio',
    required: true,
  },
  {
    key: 'calcio',
    label: 'cálcio',
    required: false,
  },
  {
    key: 'ferro',
    label: 'ferro',
    required: false,
  },
  {
    key: 'vitaminaA',
    label: 'vitamina A',
    required: false,
  },
  {
    key: 'vitaminaC',
    label: 'vitamina C',
    required: false,
  },
];

export function NutritionalTable({ 
  nutritionalInfo, 
  className = '',
  selectedVariantIndex,
  selectedVariantTitle 
}: NutritionalTableProps) {
  const [showNutrition, setShowNutrition] = useState(true);

  // Se não há informações nutricionais, não renderiza o componente
  if (!nutritionalInfo) {
    return null;
  }

  // Função para formatar valores nutricionais
  const formatNutritionalValue = (item: any): string => {
    if (!item || typeof item.quantidade === 'undefined') {
      return '***';
    }
    
    const quantidade = typeof item.quantidade === 'number' 
      ? item.quantidade.toString().replace('.', ',')
      : item.quantidade;
    
    return `${quantidade}${item.unidade || ''}`;
  };

  // Função para formatar valor diário (%VD)
  const formatVD = (item: any): string => {
    if (!item || typeof item.vd === 'undefined') {
      return '**';
    }
    return `${item.vd}%`;
  };

  // Filtrar apenas os campos que têm dados
  const availableFields = NUTRITIONAL_FIELDS.filter(
    field => nutritionalInfo[field.key] && 
             typeof nutritionalInfo[field.key].quantidade !== 'undefined'
  );

  return (
    <div className={`flex flex-col gap-2 text-paragraph-md ${className}`}>
      <div className="flex items-center gap-4 justify-between">
        <div className="flex flex-col">
          <p className="text-text-sub-600 text-title-h5 mb-0">
            informações nutricionais
          </p>
          {selectedVariantTitle && (
            <p className="text-text-sub-600 text-paragraph-xs opacity-70">
              variante: {selectedVariantTitle}
            </p>
          )}
        </div>
        <Button.Root
          variant="primary"
          mode="lighter"
          size="xsmall"
          onClick={() => setShowNutrition((prev) => !prev)}
          className="w-fit"
        >
          {showNutrition ? (
            <Button.Icon as={RiArrowDownSLine} />
          ) : (
            <Button.Icon as={RiArrowUpSLine} />
          )}
        </Button.Root>
      </div>
      
      <div
        className={`transition-all duration-300 overflow-hidden ${
          showNutrition ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        {showNutrition && (
          <>
            {/* Informação da porção */}
            {nutritionalInfo.porcao && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-paragraph-sm text-text-sub-600">
                  <strong>Porção:</strong> {nutritionalInfo.porcao.tamanho}
                  {nutritionalInfo.porcao.unidade && ` ${nutritionalInfo.porcao.unidade}`}
                </p>
              </div>
            )}
            
            {/* Tabela nutricional */}
            <div className="border border-text-sub-600 rounded-md overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-text-sub-600 text-text-white-0">
                    <th className="p-3 text-left text-paragraph-md font-semibold">
                      item
                    </th>
                    <th className="p-3 text-center text-paragraph-md font-semibold">
                      total
                    </th>
                    <th className="p-3 text-center text-paragraph-md font-semibold">
                      %VD*
                    </th>
                  </tr>
                </thead>
                <tbody className="text-text-sub-600">
                  {availableFields.map((field, index) => {
                    const item = nutritionalInfo[field.key];
                    const isLastItem = index === availableFields.length - 1;
                    
                    return (
                      <tr key={field.key}>
                        <td className={`p-2 text-paragraph-md ${!isLastItem ? 'border-b border-text-sub-600' : ''}`}>
                          {field.label}
                        </td>
                        <td className={`p-2 font-bold text-center ${!isLastItem ? 'border-b border-text-sub-600' : ''}`}>
                          {formatNutritionalValue(item)}
                        </td>
                        <td className={`p-2 font-bold text-center ${!isLastItem ? 'border-b border-text-sub-600' : ''}`}>
                          {formatVD(item)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Nota sobre valores diários */}
            <p className="text-paragraph-xs text-text-sub-600 mt-2">
              *Valores diários de referência com base em uma dieta de 2000 
              kcal ou 8400kJ. Seus valores diários podem ser maiores ou 
              menores dependendo de suas necessidades energéticas. (**) VD 
              não estabelecido. (***) Informação Não Disponível no momento.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

// Função helper para parse de dados de metafield JSON
export function parseNutritionalData(
  metafieldValue?: string | null, 
  selectedVariantIndex?: number | null
): NutritionalInfo | null {
  if (!metafieldValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(metafieldValue) as any;
    
    // Verifica se tem estrutura de variantes
    if (parsed.variants) {
      console.log('📊 Variantes disponíveis:', Object.keys(parsed.variants));
      console.log('🎯 Índice da variante selecionada:', selectedVariantIndex);
      
      // Usar índice da variante
      if (selectedVariantIndex !== null && selectedVariantIndex !== undefined) {
        const variantKey = selectedVariantIndex.toString();
        
        if (parsed.variants[variantKey]) {
          console.log('✅ Encontrou variante por índice:', variantKey);
          return parsed.variants[variantKey] as NutritionalInfo;
        }
      }
      
      // Se não encontrou por índice, usa a primeira disponível
      const firstVariant = Object.keys(parsed.variants)[0];
      if (firstVariant) {
        console.log('⚠️ Usando primeira variante disponível:', firstVariant);
        return parsed.variants[firstVariant] as NutritionalInfo;
      }
    }
    
    // Estrutura direta (sem variantes)
    const hasRequiredFields = parsed.valorEnergetico || 
                             parsed.carboidratos || 
                             parsed.proteinas;
    
    return hasRequiredFields ? (parsed as NutritionalInfo) : null;
  } catch (error) {
    console.error('Erro ao fazer parse dos dados nutricionais:', error);
    return null;
  }
} 