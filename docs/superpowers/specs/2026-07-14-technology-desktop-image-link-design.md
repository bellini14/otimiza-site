# Ajuste da imagem e do link da seção de tecnologia

A seção “Nossa tecnologia” deve, no desktop, priorizar o lado direito da imagem industrial sem alterar o enquadramento atual no mobile. O botão “Saiba mais” deve apontar diretamente para `https://otmsuite.com` em uma nova aba, usando os atributos de segurança adequados para links externos.

O enquadramento será controlado na própria imagem com uma classe responsiva aplicada apenas a partir de `lg`. O CTA deixará de usar a navegação interna do React Router e passará a ser um link externo nativo com `target="_blank"` e `rel="noopener noreferrer"`. Testes de componente verificarão o destino e a abertura segura do link, a presença de `lg:object-right` e a ausência de `object-right` sem prefixo. Uma inspeção local em viewports mobile e desktop confirmará que a máscara continua correta e que apenas o desktop muda de foco.
