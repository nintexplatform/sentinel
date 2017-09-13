@SSL @Security @Template
Feature: SSL
  Ensure that the SSL configuration of the service is robust

Background: Run the SSLyze command only once for all features
  When the SSLyze command is run against the "<Put your URL here>"

#SSL- CRIME ATTACK
Scenario: Disable SSL deflate compression in order to mitigate the risk of the CRIME attack
  Then the SSLyze output must contain the text "Compression disabled"

#SSL- CLIENT RENEGOTIATION
Scenario: Disable client renegotiations
  Then the SSLyze output must contain a line that matches .*Client-initiated Renegotiation?:\s+OK - Rejected.*

#SSL - Secure Renegotiations 
Scenario: Server should support secure renegotiation
  Then the SSLyze output must contain a line that matches .*Secure Renegotiation?:\s+OK - Supported.*

#SSL - HEARTBLEED
@Manual
Scenario: Patch OpenSSL against the Heartbleed vulnerability
  Then the SSLyze output must contain a line that matches .*Not vulnerable to Heartbleed.*

#SSL - Strong Cipher
Scenario: The minimum cipher strength should meet requirements
  Then the minimum key size must be 128 bits

#SSL - Disabled Protocols
Scenario: Disable weak SSL protocols due to numerous cryptographic weaknesses
  Then the following protocols must not be supported
      |protocol	  |
      |SSLV1      |
      |SSLV2      |
      |SSLV3      |

#SSL - OpenSSL CCS Injection vulnerability
Scenario: Server should not be vulnerable to OpenSSL CCS Injection
  Then the SSLyze output must contain a line that matches .*OK - Not vulnerable to OpenSSL CCS injection.*

#SSL - Support Strong Protocols
Scenario: Support TLSv1.2
  Then the following protocols must be supported
      |protocol	|
      |TLSV1_2  |
      |TLSV1_1  |
      |TLSV1    |

#SSL - Perfect Forward Secrecy 
Scenario: Enable Perfect forward secrecy
  Then any of the following ciphers must be supported
      | ciphers                               |
      |TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384  |
      |TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA384  |
      |TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256  |
      |TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA256  |
      |ECDHE-RSA-AES128-SHA                   |
      |ECDHE-RSA-AES256-SHA                   |
      |DHE-DSS-CAMELLIA128-SHA                |
      |DHE-DSS-CAMELLIA256-SHA                |
      |DHE-RSA-CAMELLIA128-SHA                |
      |DHE-RSA-CAMELLIA256-SHA                |
      |ECDHE-ECDSA-CAMELLIA128-SHA256         |
      |ECDHE-ECDSA-CAMELLIA256-SHA384         |
      |ECDH-ECDSA-CAMELLIA128-SHA256          |
      |ECDH-ECDSA-CAMELLIA256-SHA384          |
      |ECDHE-RSA-CAMELLIA128-SHA256           |
      |ECDHE-RSA-CAMELLIA256-SHA384           |
      |ECDH-RSA-CAMELLIA128-SHA256            |
      |ECDH-RSA-CAMELLIA256-SHA384            |

#SSL - Strict TLS Header
Scenario: The server should set Strict TLS headers
  #Then the output must contain a line that matches .*OK - HSTS header received:\s+max-age=31536000; includeSubDomains.*
  Then the SSLyze output must contain a line that matches .*Max Age:\s+31536000.*
  Then the SSLyze output must contain a line that matches .*Include Subdomains:\s+True.*

#SSL - Not Support SHA-1 Certificate 
Scenario: The certificate does not use SHA-1 any more
  Then the SSLyze output must contain a line that matches .*OK - No SHA1-signed certificate in the verified certificate chain.*

#SSL - Weak Cipher Suites 
Scenario: Weak cipher suites should be disabled
  Then the following ciphers must not be supported
         | cipher       |
         | EXP-         |
         | ADH          |
         | AECDH        |
         | NULL         |
         | DES-CBC-     |
         | RC2          |
         | RC5          |
         | MD5          |

#Certificate Key Size should be 2048 bit
Scenario: The server key should be large enough
  Then the SSLyze output must contain a line that matches .*Key Size:\s+2048.*

#Certificate Should be in valid 
Scenario: The server certificate should be trusted
  Then the certificate has a matching host name
  And the certificate is in major root CA trust stores