// Convert an ArrayBuffer to a Base64-encoded string
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  const base64 = btoa(String.fromCharCode(...bytes));
  return base64;
}

// Convert a Base64-encoded string to an ArrayBuffer
function base64ToArrayBuffer(base64) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// Generate a symmetric key for a conversation
export async function generateSymmetricKey() {
  const symmetricKey = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );

  // Export the symmetric key as a JWK object
  const symmetricKeyJwk = await crypto.subtle.exportKey("jwk", symmetricKey);

  // Return the JWK object
  return symmetricKeyJwk;
}

export async function encryptSymmetricKey(jwkSymmetricKey, base64PublicKey) {
  // Decode the base64 encoded public key
  const publicKeyBuffer = new Uint8Array(
    atob(base64PublicKey)
      .split("")
      .map((char) => char.charCodeAt(0))
  );

  // Import the public key
  const publicKey = await crypto.subtle.importKey(
    "spki",
    publicKeyBuffer,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["encrypt"]
  );

  // Import the JWK symmetric key
  const symmetricKey = await crypto.subtle.importKey(
    "jwk",
    jwkSymmetricKey,
    {
      name: "AES-GCM",
    },
    true,
    ["encrypt", "decrypt"]
  );

  // Export the symmetric key as a raw key
  const rawSymmetricKey = await crypto.subtle.exportKey("raw", symmetricKey);

  // Encrypt the raw symmetric key with the public key
  const encryptedSymmetricKey = await crypto.subtle.encrypt(
    {
      name: "RSA-OAEP",
    },
    publicKey,
    rawSymmetricKey
  );

  // Encode the encrypted symmetric key as a base64 string
  const base64EncryptedSymmetricKey = btoa(
    new Uint8Array(encryptedSymmetricKey).reduce(
      (data, byte) => data + String.fromCharCode(byte),
      ""
    )
  );

  return base64EncryptedSymmetricKey;
}

function base64DecodeToArrayBuffer(base64String) {
  const binaryString = atob(base64String);
  const buffer = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i++) {
    buffer[i] = binaryString.charCodeAt(i);
  }

  return buffer.buffer;
}

export async function decryptSymmetricKey(
  base64EncryptedSymmetricKey,
  base64PrivateKey
) {
  try {
    // Safely decode the base64 encoded encrypted symmetric key
    const encryptedSymmetricKeyBuffer = base64DecodeToArrayBuffer(
      base64EncryptedSymmetricKey
    );

    // Safely decode the base64 encoded private key
    const privateKeyBuffer = base64DecodeToArrayBuffer(base64PrivateKey);

    // Import the private key
    const privateKey = await crypto.subtle.importKey(
      "pkcs8",
      privateKeyBuffer,
      {
        name: "RSA-OAEP",
        hash: "SHA-256",
      },
      true,
      ["decrypt"]
    );
    // Decrypt the encrypted symmetric key with the private key
    const decryptedSymmetricKeyBuffer = await crypto.subtle.decrypt(
      {
        name: "RSA-OAEP",
      },
      privateKey,
      encryptedSymmetricKeyBuffer
    );

    // Import the decrypted symmetric key as a JWK
    const decryptedSymmetricKey = await crypto.subtle.importKey(
      "raw",
      decryptedSymmetricKeyBuffer,
      {
        name: "AES-GCM",
      },
      true,
      ["encrypt", "decrypt"]
    );

    // Export the decrypted symmetric key as a JWK
    const jwkDecryptedSymmetricKey = await crypto.subtle.exportKey(
      "jwk",
      decryptedSymmetricKey
    );

    return jwkDecryptedSymmetricKey;
  } catch (error) {
    console.error(error);
    if (error instanceof TypeError) {
      throw new Error("Failed to decode base64 string: " + error.message);
    } else if (error instanceof DOMException) {
      throw new Error(
        "Failed to import or export crypto key: " + error.message
      );
    } else {
      throw new Error("Failed to decrypt symmetric key: " + error.message);
    }
  }
}

export async function encryptText(plaintext, jwkSymmetricKey) {
  // Encode the plaintext as a Uint8Array
  const encoder = new TextEncoder();
  const plaintextBuffer = encoder.encode(plaintext);

  // Generate a random initialization vector (IV)
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Import the JWK symmetric key
  const symmetricKey = await crypto.subtle.importKey(
    "jwk",
    jwkSymmetricKey,
    {
      name: "AES-GCM",
    },
    true,
    ["encrypt", "decrypt"]
  );

  // Encrypt the plaintext using the symmetric key and IV
  const ciphertextBuffer = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    symmetricKey,
    plaintextBuffer
  );

  // Combine the IV and ciphertext, and encode as Base64
  const combinedBuffer = new Uint8Array(
    iv.length + ciphertextBuffer.byteLength
  );
  combinedBuffer.set(new Uint8Array(iv), 0);
  combinedBuffer.set(new Uint8Array(ciphertextBuffer), iv.length);

  const base64Combined = btoa(
    combinedBuffer.reduce((data, byte) => data + String.fromCharCode(byte), "")
  );

  return base64Combined;
}

export async function decryptText(base64Combined, jwkSymmetricKey) {
  // Decode the Base64 combined string (IV + ciphertext)
  const combinedBuffer = base64DecodeToArrayBuffer(base64Combined);

  // Extract the IV and ciphertext
  const iv = new Uint8Array(combinedBuffer.slice(0, 12));
  const ciphertextBuffer = combinedBuffer.slice(12);

  // Import the JWK symmetric key
  const symmetricKey = await crypto.subtle.importKey(
    "jwk",
    jwkSymmetricKey,
    {
      name: "AES-GCM",
    },
    true,
    ["encrypt", "decrypt"]
  );

  // Decrypt the ciphertext using the symmetric key and IV
  const plaintextBuffer = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    symmetricKey,
    ciphertextBuffer
  );

  // Decode the plaintext as a string
  const decoder = new TextDecoder();
  const plaintext = decoder.decode(plaintextBuffer);

  return plaintext;
}
