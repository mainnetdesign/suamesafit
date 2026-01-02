import {useState} from 'react';
import type {MetaFunction} from '@remix-run/react';
import {
  Root as HorizontalStepperRoot,
  Item as HorizontalStepperItem,
  ItemIndicator as HorizontalStepperItemIndicator,
  SeparatorIcon as HorizontalStepperSeparatorIcon,
} from '~/components/align-ui/ui/horizontal-stepper';

export const meta: MetaFunction = () => {
  return [{title: 'Monte Sua Marmita | Sua Mesa Fit'}];
};

// Definição dos tipos
type Ingrediente = {
  nome: string;
  quantidade: number; // em gramas
  tipo?: string; // para proteínas: 'carne', 'frango', 'vegan', 'peixe'
};

type Marmita = {
  id: number;
  titulo: string;
  quantidadeMensal: number;
  itens: {
    proteina: Ingrediente;
    carboidrato: Ingrediente;
    leguminosa?: Ingrediente;
    legumes: Ingrediente[];
    adicionais?: Ingrediente[];
  };
};

type Pedido = {
  objetivo: string;
  refeicoesPorDia: number;
  diasPorSemana: number;
  tiposDeMarmita: number;
  marmitas: Marmita[];
};

// Estado inicial do pedido
const pedidoInicial: Pedido = {
  objetivo: '',
  refeicoesPorDia: 0,
  diasPorSemana: 0,
  tiposDeMarmita: 0,
  marmitas: [],
};

// Opções para os motivos da dieta
const motivosDieta = [
  {id: 'ganho-massa', titulo: 'ganho de massa'},
  {id: 'emagrecimento', titulo: 'emagrecimento'},
  {id: 'manutencao', titulo: 'manutenção'},
  {id: 'saude-especifica', titulo: 'específica por saúde'},
];

// Opções para refeições por dia
const refeicoesPorDia = [
  {
    id: 1,
    titulo: 'Almoço ou Janta',
    subtitulo: '1 refeição por dia',
  },
  {
    id: 2,
    titulo: 'Almoço + Janta',
    subtitulo: '2 refeições por dia',
  },
];

// Opções para frequência da semana
const frequenciaSemana = [
  {
    id: 5,
    titulo: 'Segunda a Sexta',
    subtitulo: '5 marmitas por semana',
  },
  {
    id: 7,
    titulo: 'Todos os dias',
    subtitulo: '7 marmitas por semana',
  },
];

// Opções para tipos de marmita
const tiposDeMarmita = [
  {id: 1, titulo: '1 tipo de marmita'},
  {id: 2, titulo: '2 tipos de marmita'},
  {id: 3, titulo: '3 tipos de marmita'},
  {id: 4, titulo: '4 tipos de marmita'},
];

// Opções de proteína por tipo
const opcoesProteina = {
  carne: [
    'Carne moída',
    'Carne moída a jardineira',
    'Carne de panela',
    'Iscas de alcatra acebolada',
    'Iscas de alcatra',
    'Medalhão de mignon',
    'Strogonoff carne (mignon)',
  ],
  frango: [
    'Frango grelhado',
    'Frango acebolado',
    'Strogonoff de frango',
    'Frango à parmegiana',
  ],
  vegan: [
    'Proteína de soja',
    'Hambúrguer de grão de bico',
    'Falafel',
    'Tofu grelhado',
  ],
  peixe: [
    'Filé de tilápia',
    'Salmão grelhado',
    'Filé de pescada',
    'Atum grelhado',
  ],
};

// Opções de quantidade padrão
const quantidadesPadrao = [
  {valor: 90, rotulo: '90g'},
  {valor: 110, rotulo: '110g'},
  {valor: 150, rotulo: '150g'},
];

// Opções de carboidratos
const opcoesCarboidratos = [
  'Arroz branco',
  'Arroz integral',
  'Purê de batata',
  'Purê de batata doce',
  'Purê de mandioquinha',
  'Batata assada',
  'Batata doce assada',
  'Abóbora assada',
];

// Opções de leguminosas
const opcoesLeguminosas = [
  'Feijão carioca',
  'Feijão preto',
  'Grão de bico',
  'Lentilha',
];

// Opções de legumes
const opcoesLegumes = [
  'Abobrinha',
  'Abóbora',
  'Brócolis',
  'Couve flor',
  'Cenoura',
];

// Opções de adicionais
const opcoesAdicionais = [
  'Molho tomate artesanal',
  'Creme de milho sem lactose e sem glúten',
  'Creme de espinafre sem lactose e sem glúten',
  'Mussarela',
];

export default function PersonalizadaPage() {
  const [step, setStep] = useState(1);
  const [pedido, setPedido] = useState<Pedido>(pedidoInicial);
  const [marmitaAtual, setMarmitaAtual] = useState(1);
  const [tipoProteinaAtual, setTipoProteinaAtual] = useState('carne');
  const [proteinaSelecionada, setProteinaSelecionada] = useState('');
  const [quantidadeProteina, setQuantidadeProteina] = useState(110);
  const [quantidadePersonalizada, setQuantidadePersonalizada] = useState(false);
  
  // Estados para carboidrato
  const [carboidratoSelecionado, setCarboidratoSelecionado] = useState('');
  const [quantidadeCarboidrato, setQuantidadeCarboidrato] = useState(110);
  const [quantidadeCarboidratoPersonalizada, setQuantidadeCarboidratoPersonalizada] = useState(false);
  
  // Estados para leguminosa
  const [leguminosaSelecionada, setLeguminosaSelecionada] = useState('');
  const [quantidadeLeguminosa, setQuantidadeLeguminosa] = useState(110);
  const [quantidadeLeguminosaPersonalizada, setQuantidadeLeguminosaPersonalizada] = useState(false);
  const [incluirLeguminosa, setIncluirLeguminosa] = useState(true);
  
  // Estados para legumes
  const [legumeSelecionado, setLegumeSelecionado] = useState('');
  const [quantidadeLegume, setQuantidadeLegume] = useState(110);
  const [quantidadeLegumePersonalizada, setQuantidadeLegumePersonalizada] = useState(false);
  
  // Estados para adicionais
  const [adicionalSelecionado, setAdicionalSelecionado] = useState('');
  const [quantidadeAdicional, setQuantidadeAdicional] = useState(110);
  const [quantidadeAdicionalPersonalizada, setQuantidadeAdicionalPersonalizada] = useState(false);

  // Função para avançar para o próximo passo
  const avancarPasso = () => {
    if (podeAvancar()) {
      if (step === 4) {
        // Inicializa as marmitas vazias baseado na quantidade selecionada
        const marmitasIniciais = Array.from({length: pedido.tiposDeMarmita}, (_, index) => ({
          id: index + 1,
          titulo: `Marmita ${index + 1}`,
          quantidadeMensal: pedido.refeicoesPorDia * pedido.diasPorSemana * 4, // 4 semanas por mês
          itens: {
            proteina: {nome: '', quantidade: 110},
            carboidrato: {nome: '', quantidade: 0},
            legumes: [],
          },
        }));
        atualizarPedido({marmitas: marmitasIniciais});
      } else if (step >= 5 && step <= 9) {
        const marmitasAtualizadas = [...pedido.marmitas];
        const marmitaAtualObj = marmitasAtualizadas[marmitaAtual - 1];

        // Atualiza o ingrediente correspondente ao step atual
        switch (step) {
          case 5: // Proteína
            marmitaAtualObj.itens.proteina = {
              nome: proteinaSelecionada,
              quantidade: quantidadeProteina,
              tipo: tipoProteinaAtual,
            };
            break;
          case 6: // Carboidrato
            marmitaAtualObj.itens.carboidrato = {
              nome: carboidratoSelecionado,
              quantidade: quantidadeCarboidrato,
            };
            break;
          case 7: // Leguminosa
            if (incluirLeguminosa) {
              marmitaAtualObj.itens.leguminosa = {
                nome: leguminosaSelecionada,
                quantidade: quantidadeLeguminosa,
              };
            }
            break;
          case 8: // Legumes
            marmitaAtualObj.itens.legumes = [{
              nome: legumeSelecionado,
              quantidade: quantidadeLegume,
            }];
            break;
          case 9: // Adicionais
            marmitaAtualObj.itens.adicionais = [{
              nome: adicionalSelecionado,
              quantidade: quantidadeAdicional,
            }];
            break;
        }

        atualizarPedido({marmitas: marmitasAtualizadas});

        // Se ainda houver mais marmitas para configurar, volta para o step 5 e incrementa a marmita atual
        if (step === 9 && marmitaAtual < pedido.tiposDeMarmita) {
          setMarmitaAtual(marmitaAtual + 1);
          // Reseta todos os estados
          setProteinaSelecionada('');
          setQuantidadeProteina(110);
          setQuantidadePersonalizada(false);
          setTipoProteinaAtual('carne');
          setCarboidratoSelecionado('');
          setQuantidadeCarboidrato(110);
          setQuantidadeCarboidratoPersonalizada(false);
          setLeguminosaSelecionada('');
          setQuantidadeLeguminosa(110);
          setQuantidadeLeguminosaPersonalizada(false);
          setIncluirLeguminosa(true);
          setLegumeSelecionado('');
          setQuantidadeLegume(110);
          setQuantidadeLegumePersonalizada(false);
          setAdicionalSelecionado('');
          setQuantidadeAdicional(110);
          setQuantidadeAdicionalPersonalizada(false);
          setStep(5);
          return;
        }
      }
      setStep(step + 1);
    }
  };

  // Função para voltar um passo
  const voltarPasso = () => {
    if (step === 5 && marmitaAtual > 1) {
      // Se estiver configurando marmitas, volta para a marmita anterior
      setMarmitaAtual(marmitaAtual - 1);
      const marmitaAnterior = pedido.marmitas[marmitaAtual - 2];
      setProteinaSelecionada(marmitaAnterior.itens.proteina.nome);
      setQuantidadeProteina(marmitaAnterior.itens.proteina.quantidade);
      setTipoProteinaAtual(marmitaAnterior.itens.proteina.tipo || 'carne');
      setQuantidadePersonalizada(![90, 110, 150].includes(marmitaAnterior.itens.proteina.quantidade));
    } else if (step > 1) {
      setStep(step - 1);
    }
  };

  // Função que valida se pode avançar baseado no passo atual
  const podeAvancar = () => {
    switch (step) {
      case 1: // Motivos
        return pedido.objetivo !== '';
      case 2: // Refeições por dia
        return pedido.refeicoesPorDia > 0;
      case 3: // Frequência da semana
        return pedido.diasPorSemana > 0;
      case 4: // Tipos de marmita
        return pedido.tiposDeMarmita > 0;
      case 5: // Seleção de proteína
        return proteinaSelecionada !== '';
      case 6: // Seleção de carboidrato
        return carboidratoSelecionado !== '';
      case 7: // Seleção de leguminosa
        return incluirLeguminosa ? leguminosaSelecionada !== '' : true;
      case 8: // Seleção de legumes
        return legumeSelecionado !== '';
      case 9: // Seleção de adicionais
        return adicionalSelecionado !== '';
      default:
        return true;
    }
  };

  // Função para atualizar o pedido
  const atualizarPedido = (atualizacao: Partial<Pedido>) => {
    setPedido((prev) => ({...prev, ...atualizacao}));
  };

  // Função para selecionar motivo da dieta
  const selecionarMotivo = (motivo: string) => {
    atualizarPedido({objetivo: motivo});
  };

  // Função para selecionar refeições por dia
  const selecionarRefeicoesPorDia = (quantidade: number) => {
    atualizarPedido({refeicoesPorDia: quantidade});
  };

  // Função para selecionar frequência da semana
  const selecionarFrequenciaSemana = (dias: number) => {
    atualizarPedido({diasPorSemana: dias});
  };

  // Função para selecionar tipos de marmita
  const selecionarTiposDeMarmita = (tipos: number) => {
    atualizarPedido({tiposDeMarmita: tipos});
  };

  // Renderiza o conteúdo baseado no passo atual
  const renderizarConteudo = () => {
    switch (step) {
      case 1: // Motivos
        return (
          <div className="space-y-8 pt-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-text-strong-950">
                qual é motivo da sua dieta
              </h2>
              <p className="text-text-sub-600">
                qual é motivo da sua dieta
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {motivosDieta.map((motivo) => (
                <button
                  key={motivo.id}
                  onClick={() => selecionarMotivo(motivo.titulo)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    pedido.objetivo === motivo.titulo
                      ? 'border-primary-base bg-white'
                      : 'border-stroke-soft-200 bg-white hover:border-stroke-soft-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-text-strong-950 font-medium">
                      {motivo.titulo}
                    </span>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        pedido.objetivo === motivo.titulo
                          ? 'border-primary-base bg-primary-base'
                          : 'border-stroke-soft-200'
                      }`}
                    >
                      {pedido.objetivo === motivo.titulo && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 2: // Refeições por dia
        return (
          <div className="space-y-8 pt-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-text-strong-950">
                refeições por dia?
              </h2>
              <p className="text-text-sub-600">
                qual é a variação de marmita que vamos ter?
              </p>
            </div>

            <div className="space-y-4">
              {refeicoesPorDia.map((opcao) => (
                <button
                  key={opcao.id}
                  onClick={() => selecionarRefeicoesPorDia(opcao.id)}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    pedido.refeicoesPorDia === opcao.id
                      ? 'border-primary-base bg-white'
                      : 'border-stroke-soft-200 bg-white hover:border-stroke-soft-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <div className="text-text-strong-950 font-medium">
                        {opcao.titulo}
                      </div>
                      <div className="text-text-sub-600 text-sm">
                        {opcao.subtitulo}
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        pedido.refeicoesPorDia === opcao.id
                          ? 'border-primary-base bg-primary-base'
                          : 'border-stroke-soft-200'
                      }`}
                    >
                      {pedido.refeicoesPorDia === opcao.id && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 3: // Frequência da semana
        return (
          <div className="space-y-8 pt-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-text-strong-950">
                frequência das refeições
              </h2>
              <p className="text-text-sub-600">
                qual é a variação de marmita que vamos ter?
              </p>
            </div>

            <div className="space-y-4">
              {frequenciaSemana.map((opcao) => (
                <button
                  key={opcao.id}
                  onClick={() => selecionarFrequenciaSemana(opcao.id)}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    pedido.diasPorSemana === opcao.id
                      ? 'border-primary-base bg-white'
                      : 'border-stroke-soft-200 bg-white hover:border-stroke-soft-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <div className="text-text-strong-950 font-medium">
                        {opcao.titulo}
                      </div>
                      <div className="text-text-sub-600 text-sm">
                        {opcao.subtitulo}
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        pedido.diasPorSemana === opcao.id
                          ? 'border-primary-base bg-primary-base'
                          : 'border-stroke-soft-200'
                      }`}
                    >
                      {pedido.diasPorSemana === opcao.id && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 4: // Tipos de marmita
        return (
          <div className="space-y-8 pt-8 ">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-text-strong-950">
                quantos tipos de marmita
              </h2>
              <p className="text-text-sub-600">
                qual é a variação de marmita que vamos ter?
              </p>
            </div>

            <div className="space-y-4">
              {tiposDeMarmita.map((opcao) => (
                <button
                  key={opcao.id}
                  onClick={() => selecionarTiposDeMarmita(opcao.id)}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    pedido.tiposDeMarmita === opcao.id
                      ? 'border-primary-base bg-white'
                      : 'border-stroke-soft-200 bg-white hover:border-stroke-soft-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <div className="text-text-strong-950 font-medium">
                        {opcao.titulo}
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        pedido.tiposDeMarmita === opcao.id
                          ? 'border-primary-base bg-primary-base'
                          : 'border-stroke-soft-200'
                      }`}
                    >
                      {pedido.tiposDeMarmita === opcao.id && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 5: // Seleção de proteína
        return (
          <div className="space-y-8 pt-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-text-strong-950">
                selecione sua proteína
              </h2>
              <p className="text-text-sub-600">
                marmita {marmitaAtual} de {pedido.tiposDeMarmita}
              </p>
            </div>

            {/* Tabs de tipo de proteína */}
            <div className="flex space-x-2 border-b border-stroke-soft-200">
              {Object.keys(opcoesProteina).map((tipo) => (
                <button
                  key={tipo}
                  onClick={() => setTipoProteinaAtual(tipo)}
                  className={`px-4 py-2 text-sm font-medium transition-all ${
                    tipoProteinaAtual === tipo
                      ? 'border-b-2 border-primary-base text-primary-base'
                      : 'text-text-sub-600 hover:text-text-strong-950'
                  }`}
                >
                  {tipo}
                </button>
              ))}
            </div>

            {/* Lista de proteínas do tipo selecionado */}
            <div className="space-y-4">
              {opcoesProteina[tipoProteinaAtual as keyof typeof opcoesProteina].map((proteina) => (
                <button
                  key={proteina}
                  onClick={() => setProteinaSelecionada(proteina)}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    proteinaSelecionada === proteina
                      ? 'border-primary-base bg-white'
                      : 'border-stroke-soft-200 bg-white hover:border-stroke-soft-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-text-strong-950 font-medium">
                      {proteina}
                    </span>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        proteinaSelecionada === proteina
                          ? 'border-primary-base bg-primary-base'
                          : 'border-stroke-soft-200'
                      }`}
                    >
                      {proteinaSelecionada === proteina && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Seleção de quantidade */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-text-strong-950">
                qual é a quantidade da proteína
              </h3>
              
              {/* Opções fixas */}
              <div className="grid grid-cols-3 gap-4">
                {quantidadesPadrao.map((opcao) => (
                  <button
                    key={opcao.valor}
                    onClick={() => {
                      setQuantidadeProteina(opcao.valor);
                      setQuantidadePersonalizada(false);
                    }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      quantidadeProteina === opcao.valor && !quantidadePersonalizada
                        ? 'border-primary-base bg-white'
                        : 'border-stroke-soft-200 bg-white hover:border-stroke-soft-300'
                    }`}
                  >
                    {opcao.rotulo}
                  </button>
                ))}
              </div>

              {/* Quantidade personalizada */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => {
                    if (quantidadePersonalizada && quantidadeProteina > 90) {
                      setQuantidadeProteina(quantidadeProteina - 10);
                    }
                  }}
                  className="w-10 h-10 rounded-lg border border-stroke-soft-200 flex items-center justify-center"
                  disabled={!quantidadePersonalizada || quantidadeProteina <= 90}
                >
                  -
                </button>
                
                <div
                  onClick={() => setQuantidadePersonalizada(true)}
                  className={`flex-1 p-4 rounded-lg border-2 text-center cursor-pointer ${
                    quantidadePersonalizada
                      ? 'border-primary-base'
                      : 'border-stroke-soft-200'
                  }`}
                >
                  {quantidadeProteina}g
                </div>
                
                <button
                  onClick={() => {
                    if (quantidadePersonalizada && quantidadeProteina < 200) {
                      setQuantidadeProteina(quantidadeProteina + 10);
                    }
                  }}
                  className="w-10 h-10 rounded-lg border border-stroke-soft-200 flex items-center justify-center"
                  disabled={!quantidadePersonalizada || quantidadeProteina >= 200}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        );

      case 6: // Seleção de carboidrato
        return (
          <div className="space-y-8 pt-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-text-strong-950">
                selecione seu carboidrato
              </h2>
              <p className="text-text-sub-600">
                marmita {marmitaAtual} de {pedido.tiposDeMarmita}
              </p>
            </div>

            {/* Lista de carboidratos */}
            <div className="space-y-4">
              {opcoesCarboidratos.map((carboidrato) => (
                <button
                  key={carboidrato}
                  onClick={() => setCarboidratoSelecionado(carboidrato)}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    carboidratoSelecionado === carboidrato
                      ? 'border-primary-base bg-white'
                      : 'border-stroke-soft-200 bg-white hover:border-stroke-soft-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-text-strong-950 font-medium">
                      {carboidrato}
                    </span>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        carboidratoSelecionado === carboidrato
                          ? 'border-primary-base bg-primary-base'
                          : 'border-stroke-soft-200'
                      }`}
                    >
                      {carboidratoSelecionado === carboidrato && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Seleção de quantidade */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-text-strong-950">
                qual é a quantidade do carboidrato
              </h3>
              
              {/* Opções fixas */}
              <div className="grid grid-cols-3 gap-4">
                {quantidadesPadrao.map((opcao) => (
                  <button
                    key={opcao.valor}
                    onClick={() => {
                      setQuantidadeCarboidrato(opcao.valor);
                      setQuantidadeCarboidratoPersonalizada(false);
                    }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      quantidadeCarboidrato === opcao.valor && !quantidadeCarboidratoPersonalizada
                        ? 'border-primary-base bg-white'
                        : 'border-stroke-soft-200 bg-white hover:border-stroke-soft-300'
                    }`}
                  >
                    {opcao.rotulo}
                  </button>
                ))}
              </div>

              {/* Quantidade personalizada */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => {
                    if (quantidadeCarboidratoPersonalizada && quantidadeCarboidrato > 90) {
                      setQuantidadeCarboidrato(quantidadeCarboidrato - 10);
                    }
                  }}
                  className="w-10 h-10 rounded-lg border border-stroke-soft-200 flex items-center justify-center"
                  disabled={!quantidadeCarboidratoPersonalizada || quantidadeCarboidrato <= 90}
                >
                  -
                </button>
                
                <div
                  onClick={() => setQuantidadeCarboidratoPersonalizada(true)}
                  className={`flex-1 p-4 rounded-lg border-2 text-center cursor-pointer ${
                    quantidadeCarboidratoPersonalizada
                      ? 'border-primary-base'
                      : 'border-stroke-soft-200'
                  }`}
                >
                  {quantidadeCarboidrato}g
                </div>
                
                <button
                  onClick={() => {
                    if (quantidadeCarboidratoPersonalizada && quantidadeCarboidrato < 200) {
                      setQuantidadeCarboidrato(quantidadeCarboidrato + 10);
                    }
                  }}
                  className="w-10 h-10 rounded-lg border border-stroke-soft-200 flex items-center justify-center"
                  disabled={!quantidadeCarboidratoPersonalizada || quantidadeCarboidrato >= 200}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        );

      case 7: // Seleção de leguminosa
        return (
          <div className="space-y-8 pt-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-text-strong-950">
                selecione sua leguminosa
              </h2>
              <p className="text-text-sub-600">
                marmita {marmitaAtual} de {pedido.tiposDeMarmita}
              </p>
            </div>

            {/* Lista de leguminosas */}
            <div className="space-y-4">
              {opcoesLeguminosas.map((leguminosa) => (
                <button
                  key={leguminosa}
                  onClick={() => setLeguminosaSelecionada(leguminosa)}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    leguminosaSelecionada === leguminosa
                      ? 'border-primary-base bg-white'
                      : 'border-stroke-soft-200 bg-white hover:border-stroke-soft-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-text-strong-950 font-medium">
                      {leguminosa}
                    </span>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        leguminosaSelecionada === leguminosa
                          ? 'border-primary-base bg-primary-base'
                          : 'border-stroke-soft-200'
                      }`}
                    >
                      {leguminosaSelecionada === leguminosa && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Seleção de quantidade */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-text-strong-950">
                qual é a quantidade da leguminosa
              </h3>
              
              {/* Opções fixas */}
              <div className="grid grid-cols-3 gap-4">
                {quantidadesPadrao.map((opcao) => (
                  <button
                    key={opcao.valor}
                    onClick={() => {
                      setQuantidadeLeguminosa(opcao.valor);
                      setQuantidadeLeguminosaPersonalizada(false);
                    }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      quantidadeLeguminosa === opcao.valor && !quantidadeLeguminosaPersonalizada
                        ? 'border-primary-base bg-white'
                        : 'border-stroke-soft-200 bg-white hover:border-stroke-soft-300'
                    }`}
                  >
                    {opcao.rotulo}
                  </button>
                ))}
              </div>

              {/* Quantidade personalizada */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => {
                    if (quantidadeLeguminosaPersonalizada && quantidadeLeguminosa > 90) {
                      setQuantidadeLeguminosa(quantidadeLeguminosa - 10);
                    }
                  }}
                  className="w-10 h-10 rounded-lg border border-stroke-soft-200 flex items-center justify-center"
                  disabled={!quantidadeLeguminosaPersonalizada || quantidadeLeguminosa <= 90}
                >
                  -
                </button>
                
                <div
                  onClick={() => setQuantidadeLeguminosaPersonalizada(true)}
                  className={`flex-1 p-4 rounded-lg border-2 text-center cursor-pointer ${
                    quantidadeLeguminosaPersonalizada
                      ? 'border-primary-base'
                      : 'border-stroke-soft-200'
                  }`}
                >
                  {quantidadeLeguminosa}g
                </div>
                
                <button
                  onClick={() => {
                    if (quantidadeLeguminosaPersonalizada && quantidadeLeguminosa < 200) {
                      setQuantidadeLeguminosa(quantidadeLeguminosa + 10);
                    }
                  }}
                  className="w-10 h-10 rounded-lg border border-stroke-soft-200 flex items-center justify-center"
                  disabled={!quantidadeLeguminosaPersonalizada || quantidadeLeguminosa >= 200}
                >
                  +
                </button>
              </div>
            </div>

            {/* Botão para não incluir leguminosas */}
            <button
              onClick={() => {
                setIncluirLeguminosa(false);
                avancarPasso();
              }}
              className="w-full p-4 rounded-lg border border-stroke-soft-200 bg-bg-black-0 text-text-sub-600"
            >
              não quero leguminosas
            </button>
          </div>
        );

      case 8: // Seleção de legumes
        return (
          <div className="space-y-8 pt-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-text-strong-950">
                selecione seus legumes
              </h2>
              <p className="text-text-sub-600">
                marmita {marmitaAtual} de {pedido.tiposDeMarmita}
              </p>
            </div>

            {/* Lista de legumes */}
            <div className="space-y-4">
              {opcoesLegumes.map((legume) => (
                <button
                  key={legume}
                  onClick={() => setLegumeSelecionado(legume)}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    legumeSelecionado === legume
                      ? 'border-primary-base bg-white'
                      : 'border-stroke-soft-200 bg-white hover:border-stroke-soft-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-text-strong-950 font-medium">
                      {legume}
                    </span>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        legumeSelecionado === legume
                          ? 'border-primary-base bg-primary-base'
                          : 'border-stroke-soft-200'
                      }`}
                    >
                      {legumeSelecionado === legume && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Seleção de quantidade */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-text-strong-950">
                qual é a quantidade do legume
              </h3>
              
              {/* Opções fixas */}
              <div className="grid grid-cols-3 gap-4">
                {quantidadesPadrao.map((opcao) => (
                  <button
                    key={opcao.valor}
                    onClick={() => {
                      setQuantidadeLegume(opcao.valor);
                      setQuantidadeLegumePersonalizada(false);
                    }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      quantidadeLegume === opcao.valor && !quantidadeLegumePersonalizada
                        ? 'border-primary-base bg-white'
                        : 'border-stroke-soft-200 bg-white hover:border-stroke-soft-300'
                    }`}
                  >
                    {opcao.rotulo}
                  </button>
                ))}
              </div>

              {/* Quantidade personalizada */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => {
                    if (quantidadeLegumePersonalizada && quantidadeLegume > 90) {
                      setQuantidadeLegume(quantidadeLegume - 10);
                    }
                  }}
                  className="w-10 h-10 rounded-lg border border-stroke-soft-200 flex items-center justify-center"
                  disabled={!quantidadeLegumePersonalizada || quantidadeLegume <= 90}
                >
                  -
                </button>
                
                <div
                  onClick={() => setQuantidadeLegumePersonalizada(true)}
                  className={`flex-1 p-4 rounded-lg border-2 text-center cursor-pointer ${
                    quantidadeLegumePersonalizada
                      ? 'border-primary-base'
                      : 'border-stroke-soft-200'
                  }`}
                >
                  {quantidadeLegume}g
                </div>
                
                <button
                  onClick={() => {
                    if (quantidadeLegumePersonalizada && quantidadeLegume < 200) {
                      setQuantidadeLegume(quantidadeLegume + 10);
                    }
                  }}
                  className="w-10 h-10 rounded-lg border border-stroke-soft-200 flex items-center justify-center"
                  disabled={!quantidadeLegumePersonalizada || quantidadeLegume >= 200}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        );

      case 9: // Seleção de adicionais
        return (
          <div className="space-y-8 pt-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-text-strong-950">
                selecione adicionais
              </h2>
              <p className="text-text-sub-600">
                marmita {marmitaAtual} de {pedido.tiposDeMarmita}
              </p>
            </div>

            {/* Lista de adicionais */}
            <div className="space-y-4">
              {opcoesAdicionais.map((adicional) => (
                <button
                  key={adicional}
                  onClick={() => setAdicionalSelecionado(adicional)}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    adicionalSelecionado === adicional
                      ? 'border-primary-base bg-white'
                      : 'border-stroke-soft-200 bg-white hover:border-stroke-soft-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-text-strong-950 font-medium">
                      {adicional}
                    </span>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        adicionalSelecionado === adicional
                          ? 'border-primary-base bg-primary-base'
                          : 'border-stroke-soft-200'
                      }`}
                    >
                      {adicionalSelecionado === adicional && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Seleção de quantidade */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-text-strong-950">
                qual é a quantidade do adicional
              </h3>
              
              {/* Opções fixas */}
              <div className="grid grid-cols-3 gap-4">
                {quantidadesPadrao.map((opcao) => (
                  <button
                    key={opcao.valor}
                    onClick={() => {
                      setQuantidadeAdicional(opcao.valor);
                      setQuantidadeAdicionalPersonalizada(false);
                    }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      quantidadeAdicional === opcao.valor && !quantidadeAdicionalPersonalizada
                        ? 'border-primary-base bg-white'
                        : 'border-stroke-soft-200 bg-white hover:border-stroke-soft-300'
                    }`}
                  >
                    {opcao.rotulo}
                  </button>
                ))}
              </div>

              {/* Quantidade personalizada */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => {
                    if (quantidadeAdicionalPersonalizada && quantidadeAdicional > 90) {
                      setQuantidadeAdicional(quantidadeAdicional - 10);
                    }
                  }}
                  className="w-10 h-10 rounded-lg border border-stroke-soft-200 flex items-center justify-center"
                  disabled={!quantidadeAdicionalPersonalizada || quantidadeAdicional <= 90}
                >
                  -
                </button>
                
                <div
                  onClick={() => setQuantidadeAdicionalPersonalizada(true)}
                  className={`flex-1 p-4 rounded-lg border-2 text-center cursor-pointer ${
                    quantidadeAdicionalPersonalizada
                      ? 'border-primary-base'
                      : 'border-stroke-soft-200'
                  }`}
                >
                  {quantidadeAdicional}g
                </div>
                
                <button
                  onClick={() => {
                    if (quantidadeAdicionalPersonalizada && quantidadeAdicional < 200) {
                      setQuantidadeAdicional(quantidadeAdicional + 10);
                    }
                  }}
                  className="w-10 h-10 rounded-lg border border-stroke-soft-200 flex items-center justify-center"
                  disabled={!quantidadeAdicionalPersonalizada || quantidadeAdicional >= 200}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        );

      case 10: // Resumo do pedido
        return (
          <div className="space-y-8 pt-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-text-strong-950">
                resumo do pedido
              </h2>
              <p className="text-text-sub-600">
                confira se está tudo correto na sua direita, após finalizarmos iremos
                avaliar o seu orçamento e te retornar com as próximas informações
              </p>
            </div>

            {/* Cards das marmitas */}
            <div className="grid grid-cols-2 gap-4">
              {pedido.marmitas.map((marmita, index) => (
                <div
                  key={marmita.id}
                  className="bg-white rounded-lg p-4 border border-stroke-soft-200"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">#{index + 1} marmita</h3>
                    <button className="text-primary-base underline">editar</button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>proteína</span>
                      <span>{marmita.itens.proteina.nome} ({marmita.itens.proteina.quantidade}g)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>carboidrato</span>
                      <span>{marmita.itens.carboidrato.nome} ({marmita.itens.carboidrato.quantidade}g)</span>
                    </div>
                    {marmita.itens.leguminosa && (
                      <div className="flex justify-between">
                        <span>leguminosas</span>
                        <span>{marmita.itens.leguminosa.nome} ({marmita.itens.leguminosa.quantidade}g)</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>legumes</span>
                      <span>{marmita.itens.legumes[0].nome} ({marmita.itens.legumes[0].quantidade}g)</span>
                    </div>
                    {marmita.itens.adicionais && marmita.itens.adicionais.length > 0 && (
                      <div className="flex justify-between">
                        <span>adicionais</span>
                        <span>{marmita.itens.adicionais[0].nome} ({marmita.itens.adicionais[0].quantidade}g)</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>total</span>
                      <span>{marmita.quantidadeMensal} marmitas</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Informações gerais */}
            <div className="bg-white rounded-lg p-4 border border-stroke-soft-200">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>frequência</span>
                  <span>{pedido.diasPorSemana === 7 ? 'todos os dias' : 'segunda a sexta'}</span>
                </div>
                <div className="flex justify-between">
                  <span>quantidade diária</span>
                  <span>{pedido.refeicoesPorDia === 2 ? 'almoço + janta' : 'almoço ou janta'}</span>
                </div>
                <div className="flex justify-between">
                  <span>total</span>
                  <span>{pedido.refeicoesPorDia * pedido.diasPorSemana * 4} marmitas/mês</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Etapa não implementada ainda</div>;
    }
  };

  // Determina o estado do stepper baseado no passo atual
  const getStepperState = () => {
    if (step <= 1) return {motivos: 'active' as const, frequencia: 'default' as const, marmitas: 'default' as const};
    if (step <= 3) return {motivos: 'completed' as const, frequencia: 'active' as const, marmitas: 'default' as const};
    return {motivos: 'completed' as const, frequencia: 'completed' as const, marmitas: 'active' as const};
  };

  const stepperState = getStepperState();

  return (
    <div className="min-h-screen bg-bg-black-0 flex items-center justify-center">
      <div className="max-w-md mx-auto space-y-8">
        {/* Stepper */}
        <HorizontalStepperRoot>
          <HorizontalStepperItem state={stepperState.motivos}>
            <HorizontalStepperItemIndicator />
            <span>motivos</span>
          </HorizontalStepperItem>
          
          <HorizontalStepperSeparatorIcon />
          
          <HorizontalStepperItem state={stepperState.frequencia}>
            <HorizontalStepperItemIndicator />
            <span>frequência</span>
          </HorizontalStepperItem>
          
          <HorizontalStepperSeparatorIcon />
          
          <HorizontalStepperItem state={stepperState.marmitas}>
            <HorizontalStepperItemIndicator />
            <span>marmitas</span>
          </HorizontalStepperItem>
        </HorizontalStepperRoot>

        {/* Conteúdo do passo atual */}
        {renderizarConteudo()}

        {/* Botões de navegação */}
        <div className="flex justify-between pt-8">
          <button
            onClick={voltarPasso}
            disabled={step === 1}
            className="px-6 py-3 bg-white border border-stroke-soft-200 rounded-lg text-text-strong-950 disabled:opacity-50 flex items-center gap-2"
          >
            <span>‹</span>
            voltar
          </button>
          
          <button
            onClick={avancarPasso}
            disabled={!podeAvancar()}
            className="px-8 py-3 bg-primary-base text-white rounded-lg disabled:opacity-50"
          >
            continuar
          </button>
        </div>
      </div>
    </div>
  );
}