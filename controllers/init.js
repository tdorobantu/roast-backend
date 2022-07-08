export const appAPI = async (req, res) => {
  return res.status(200).json({ message: "The cake is a lie!" });
};
