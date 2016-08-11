Default Math Syntax
-------------------

### Inline Math ###

* Double backslash with parentheses.
  \\( A_i = B_i + C_i \sum_{k=0}^{i} D_k E^k \\)

### Display Math ###

* Double backslash with bracket.

  \\[ A_i = B_i + C_i \sum_{k=0}^{i} D_k E^k + dx \\]

* Double dollar signs.
  $$A_i = B_i + C_i \sum_{k=0}^{i} D_k E^k + dx$$

* LaTeX `equation` environment

  \begin{equation}
    A_i = B_i + C_i \sum_{k=0}^{i} D_k E^k + dx
  \end{equation}

* LaTeX `eqnarray` environment

  \begin{eqnarray}
    A_i &=& B_i + C_i \sum_{k=0}^{i} D_k E^k \\
    F_i &=& \int_{-\infty}^{x_i} f(x) dx
  \end{eqnarray}

LaTeX Math Syntax
-----------------

### Inline Math ###

* Single dollar sign.
  $A_i = B_i + C_i \sum_{k=0}^{i} D_k E^k + dx$

* Single backslash with parentheses.
  \(  A_i = B_i + C_i \sum_{k=0}^{i} D_k E^k + dx \)

### Display Math ###

* Single backslash with brackets.
  \[  A_i = B_i + C_i \sum_{k=0}^{i} D_k E^k + dx \]

### Escaped Characters ###

* Dollar sign.  \$100.00

