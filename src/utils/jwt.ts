import jwt from 'jsonwebtoken';

async function jwtToken(payload: any) {
  const token = await jwt.sign(
    { id: payload },
    process.env.JWT_SECRET_KEY as string,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );
  return token;
}

export default jwtToken;
