# Carrossel infinito da seção de tecnologia

O mosaico animado da seção “Nossa tecnologia” deve manter movimento vertical contínuo, sem alcançar uma extremidade vazia ou parar após um ciclo.

A correção substitui o trilho único com quarenta células por dois ciclos semanticamente idênticos dentro de cada coluna. Cada ciclo contém vinte células e inclui o próprio espaçamento final, fazendo com que os dois ciclos tenham exatamente a mesma altura. O trilho se desloca de `0` a `-50%`; nesse ponto, o segundo ciclo ocupa exatamente a posição do primeiro e a reinicialização é visualmente contínua.

A animação será definida por classes específicas da seção, em vez de depender dos cálculos responsivos do Tailwind. As duas colunas usam a mesma geometria, em direções opostas, com `linear infinite`. Um teste de regressão verifica a duplicação dos ciclos e a declaração CSS infinita.
