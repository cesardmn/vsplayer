# VS Player

## Visão Geral

**VS Player** é um player de áudio desenvolvido para execução ao vivo de **VS** em **LR** com foco em praticidade, performance e estabilidade.

A aplicação oferece uma interface limpa e responsiva, com controles acessíveis via teclado, suporte completo a dispositivos móveis e visualização clara da wave de áudio.

Recursos como **Wake Lock** e **IndexedDB** garantem uma experiência fluida e contínua, mesmo em cenários de uso intensivo ao vivo.

---

## Funcionalidades Principais

- **Reprodução de áudio**
  Suporte para arquivos nos formatos **MP3**, **WAV** e **AAC**.

- **Visualização de waveform**
  Exibição detalhada da forma de onda com **WaveSurfer.js**, utilizando pré-processamento para maior desempenho.

- **Armazenamento offline**
  Todos os áudios são processados apenas na primeira importação e salvos no **IndexedDB**, permitindo reprodução instantânea em usos futuros.

- **Controles versáteis**

- Navegação por **teclado físico ou bluetooth**
- Troca de faixa sem interromper a reprodução atual

- **Otimização para mobile**

- Comportamento como **PWA instalável**
- **Wake Lock** mantém a tela ativa durante o uso
- Interface 100% responsiva

---

## Controles de Navegação

- **← (Seta Esquerda)**: Avança para a próxima faixa (cíclica)
- **→ (Seta Direita)**: Reproduz ou para o áudio atual (toggle play/stop)

---

## Clone e Desenvolvimento

### 1. Instalação

```bash
git clone https://github.com/seu-usuario/vsplayer.git
cd vsplayer
npm install
```

### 2. Execução

**Ambiente de desenvolvimento** (hot-reload):

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

**Build de produção**:

```bash
npm run build
```

**Preview da build local**:

```bash
npm run preview
```

Acesse: [http://localhost:4173](http://localhost:4173)

---

## Estrutura Técnica

| Camada       | Tecnologia                  |
| ------------ | --------------------------- |
| **Frontend** | React 19 + Vite             |
| **UI/UX**    | Tailwind CSS                |
| **Estado**   | Zustand                     |
| **Áudio**    | WaveSurfer.js               |
| **Storage**  | IndexedDB (via IDB Wrapper) |

---

## Licença

MIT © 2025 \[Cesar Dimi]
