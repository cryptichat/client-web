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
      atob(base64PublicKey).split("").map((char) => char.charCodeAt(0))
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
  
  
