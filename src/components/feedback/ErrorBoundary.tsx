import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Rede de segurança pra qualquer erro de render não tratado (ex: um campo
 * inesperado vindo do back-end) — sem isso, um erro assim derruba a árvore
 * de componentes inteira e deixa a tela em branco, sem explicação nem
 * saída, pro usuário. Em vez de tentar manter o app vivo com estado
 * potencialmente inconsistente, força um reload pra tela inicial
 * (window.location, não navigate do react-router — mais confiável depois
 * de um crash, já que não depende do próprio React continuar funcionando).
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Erro não tratado na interface:", error, info.componentStack);
    window.location.assign("/");
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}
