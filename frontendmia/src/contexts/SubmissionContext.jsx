import { createContext, useContext, useEffect, useMemo, useState } from "react";

const Context = createContext();

export default function SubmissionProvider({ children }) {
  const [submission, setSubmission] = useState([]);

  const value = useMemo(
    () => ({
      submission,
      setSubmission,
    }),
    [submission],
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export const useSubmission = () => {
  return useContext(Context);
};
