"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { createLoan } from "@/services/loans";
import { useSession } from "next-auth/react";
import { getUserByWorldUserId } from "@/services/users";

interface LoanCardProps {
  type: string;
  amount: string;
  installments: string;
  disabled?: boolean;
}

export function LoanCard({
  type,
  amount,
  installments,
  disabled = false,
}: LoanCardProps) {
  const router = useRouter();
  const { data: session } = useSession();

  console.log(session);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    if (!disabled) {
      if (!session?.user?.name) {
        setError("Please login first");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const user = await getUserByWorldUserId(session.user.name);
        if (!user) {
          setError("Could not find your user account");
          return;
        }

        const loan = await createLoan({
          amount: parseInt(amount),
          min_backers: 2,
          borrower_id: user.id,
          status: "pending",
        });

        if (loan) {
          router.push(`/explanation/${loan.id}`);
        }
      } catch (error) {
        console.error("Error creating loan:", error);
        setError("Failed to create loan. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const calculateInterest = () => {
    const principal = parseInt(amount);
    const monthlyRate = 0.1 / 12; // 10% annual rate divided by 12 months
    const numInstallments = parseInt(installments);
    const monthlyPayment =
      (principal * monthlyRate) /
      (1 - Math.pow(1 + monthlyRate, -numInstallments));
    const totalPayment = monthlyPayment * numInstallments;
    const totalInterest = totalPayment - principal;
    return Math.round(totalInterest);
  };

  return (
    <Card
      className={`p-5 transition-all duration-300 ${
        disabled || isLoading
          ? "cursor-not-allowed bg-gray-200"
          : "cursor-pointer bg-purple-500 hover:bg-purple-600"
      }`}
      onClick={handleClick}
    >
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-start">
          <h2
            className={`text-xl font-medium ${
              disabled || isLoading ? "text-gray-500" : "text-white"
            }`}
          >
            {type}
          </h2>
          <span
            className={`text-sm font-medium ${
              disabled || isLoading ? "text-gray-500" : "text-white"
            }`}
          >
            10% APR
          </span>
        </div>
        <div>
          <p
            className={`text-5xl font-bold mt-1 ${
              disabled || isLoading ? "text-gray-400" : "text-white"
            }`}
          >
            ${amount}
          </p>
          <p
            className={`text-sm mt-1 ${
              disabled || isLoading ? "text-gray-500" : "text-white"
            }`}
          >
            {isLoading ? "Creating loan..." : `${installments} installments`}
          </p>
          <p
            className={`text-sm mt-1 ${
              disabled || isLoading ? "text-gray-500" : "text-white"
            }`}
          >
            You pay back: ${parseInt(amount) + calculateInterest()}
          </p>
        </div>
        {error && (
          <div className="bg-destructive/10 text-destructive p-2 rounded-md text-sm">
            {error}
          </div>
        )}
      </div>
    </Card>
  );
}
