// mocks hitting an external service to authenticate a user
export const authenticateUser = async (handshake: any) => {
  return new Promise<any>((resolve, reject) => {
    setTimeout(() => {
      // as if the api took time to respond
      // in reality the website portion of your game should generate an auth token
      // which this game instance can use to get your player data (assuming a game that
      // requires authentication and loads a persistent character)
      if (handshake.token === 12345) {
        // fake data, which we ignore...
        resolve({ character: "neuron", level: 24, hp: 89 });
      } else {
        reject("Connection denied: invalid token.");
      }
    }, 500);
  });
};
