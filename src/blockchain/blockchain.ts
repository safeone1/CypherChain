import * as crypto from "crypto";

// Represents a certificate issuance (instead of a transaction)
export interface Certificate {
  hash: string; // hash of certificate
  certificateHash: string; // hash of certificate document
  issuerId: string; // issuer unique ID
  recipientId: string; // recipient unique ID
  certificateType: string; // e.g., Bachelor of Science
  issueDate: string; // e.g., "2025-05-26"
  documentHash: string; // hash of the document
  document?: string; // raw certificate data (string or serialized)
}

// Implementation of Certificate interface
export class CertificateImpl implements Certificate {
  constructor(
    public hash: string, // hash of certificate
    public certificateHash: string, // hash of certificate document
    public issuerId: string, // issuer unique ID
    public recipientId: string, // recipient unique ID
    public certificateType: string, // e.g., Bachelor of Science
    public issueDate: string, // e.g., "2025-05-26"
    public documentHash: string, // hash of the document
    public document?: string // raw certificate data (string or serialized)
  ) {}

  toString() {
    return JSON.stringify(this);
  }
}

export class Block {
  constructor(
    public index: number,
    public prevHash: string,
    public certificate: Certificate,
    public timestamp = Date.now()
  ) {}

  get hash() {
    const str = JSON.stringify(this);
    const hash = crypto.createHash("SHA256");
    hash.update(str).end();
    return hash.digest("hex");
  }
}

export class Issuer {
  public publicKey: string;
  public privateKey: string;
  public issuerId: string;

  constructor(issuerId: string) {
    this.issuerId = issuerId;

    const keypair = crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: "spki",
        format: "pem",
      },
      privateKeyEncoding: {
        type: "pkcs8",
        format: "pem",
      },
    });

    this.privateKey = keypair.privateKey;
    this.publicKey = keypair.publicKey;
  }

  issueCertificate(
    recipientId: string,
    certificateType: string,
    certificateDocument: string // raw certificate data (string or serialized)
  ) {
    // Hash the certificate document
    const certHash = crypto
      .createHash("SHA256")
      .update(certificateDocument)
      .digest("hex");

    // Create certificate object
    const certificate = new CertificateImpl(
      crypto.createHash("SHA256").update(certHash).digest("hex"),
      certHash,
      this.issuerId,
      recipientId,
      certificateType,
      new Date().toISOString(),
      certHash,
      certificateDocument
    );

    // Sign the certificate
    const sign = crypto.createSign("SHA256");
    sign.update(certificate.toString()).end();
    const signature = sign.sign(this.privateKey);

    // Add block with signed certificate to the chain
    Chain.instance.addBlock(certificate, this.publicKey, signature);

    return { certificate, signature: signature.toString("base64") };
  }
}

export class Chain {
  public static instance = new Chain();
  chain: Block[];

  constructor() {
    // Genesis block with dummy certificate
    this.chain = [
      new Block(
        0, // Index for genesis block
        "0",
        new CertificateImpl(
          crypto.createHash("SHA256").update("0").digest("hex"),
          "0",
          "genesis",
          "none",
          "Genesis Certificate",
          new Date().toISOString(),
          "0"
        )
      ),
    ];
  }

  get lastBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  addBlock(
    certificate: Certificate,
    issuerPublicKey: string,
    signature: Buffer
  ) {
    // Verify signature before adding block
    const verifier = crypto.createVerify("SHA256");
    verifier.update(certificate.toString());
    const isValid = verifier.verify(issuerPublicKey, signature);

    if (isValid) {
      const newBlock = new Block(
        this.lastBlock.index + 1,
        this.lastBlock.hash,
        certificate
      );
      this.chain.push(newBlock);
      console.log("Block added to chain:", newBlock);
    } else {
      console.log("Invalid certificate signature. Block rejected.");
    }
  }

  addCertificate(cert: Certificate) {
    const newBlock = new Block(
      this.lastBlock.index + 1,
      this.lastBlock.hash,
      cert,
      Date.now()
    );
    this.chain.push(newBlock);
  }
}

// Example usage

// const university = new Issuer("UniversityXYZ");

// // Pretend this is a certificate document content
// const certificateDocument = JSON.stringify({
//   studentName: "Alice",
//   degree: "Bachelor of Science",
//   major: "Computer Science",
//   graduationYear: 2025,
// });

// // University issues a certificate to Alice
// const { certificate, signature } = university.issueCertificate(
//   "student123",
//   "Bachelor of Science in Computer Science",
//   certificateDocument
// );

// console.log("Certificate issued:", certificate);
// console.log("Signature (base64):", signature);

// // Blockchain content
// console.log("Blockchain:", Chain.instance.chain);
