asciimath formula test
-------------------

* inline data ``Z_(0..n)`` and formula ``1/x`` mix test

* mix inline formula ``Z_{0..n}`` outline formula

  ``A_i = B_i + C_{i} sum_{k=0}^{i} D_k E^k + dx``

  and few formula in Paragraph test

  ``f(x) = ( Gamma((n+1)/2) )/( sqrt(n pi) Gamma(n/2) ) (1 + x^2/n)^(-(n+1)/2)``

  formula in bolb **``e^2/(1-x)``**

* gt formula ``Re(z) > 0``test, lt ``Re(z) < [0];`` test

* test one dollar \$200 est

* Display formula
  ```asciimath
  Gamma(x) = int_0^(+oo) t^(x-1)"e"^-t dt
  ```
  `` f(x) = sqrt(sum_0^100 n) ``

* Double backslash with parentheses.
  `` A_i = B_i + C_i sum_(k=0)^i D_k E^k ``

* Test multi-row formula

  `` {: 1, 2, 3; 4, 5, 6; 7, 8, 9; :} ``
  ```AM
  [
    1, 2, 3;
    4, 5, 6;
    7, 8, 9;
  ]
  ```

* test formula in php code

  ```php
  $subject = $this->secureHeader($subject);
  $params = [$kind, $address, $name];
  $this->setError($error_message);
  $this->edebug($error_message);
  ```

* test formula in table

  head1|head2
  -----|------
  1  | data: ``Z_(0..n)``
  2  | formula ``{:1/(x-1):}^2``
