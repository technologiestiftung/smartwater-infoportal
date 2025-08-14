import React from "react";
import { ErrorBoundary } from "react-error-boundary";

interface ErrorCatcherProps {
	children: React.ReactNode;
	name: string;
}

const ErrorCatcher: React.FC<ErrorCatcherProps> = ({ children, name }) => {
	return (
		<ErrorBoundary
			fallback={
				<h1 className="text-red">
					---Error in Component---
					<br />
					{name}
				</h1>
			}
		>
			{children}
		</ErrorBoundary>
	);
};

export default ErrorCatcher;
