export const getUsers = (req, res, next) => {
  return res.status(200).send({
    data: [
      {
        name: {
          first: "Victoria Shen Fen",
          last: "Tan",
          middle: "iKlaire"
        }
      },
      {
        name: {
          first: "Vivien",
          last: "Wee",
          middle: "Dudu"
        }
      }
    ]
  });
};
