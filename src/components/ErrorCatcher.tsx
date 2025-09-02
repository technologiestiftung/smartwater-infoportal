import React from "react";
import { ErrorBoundary } from "react-error-boundary";

interface ErrorCatcherProps {
	children: React.ReactNode;
	name: string;
}

const ErrorCatcher: React.FC<ErrorCatcherProps> = ({ children, name }) => {
	return (
		<ErrorBoundary
			fallbackRender={({ error }) => (
				<div className="text-red whitespace-pre-wrap">
					<h1>--- Error in Component ---</h1>
					<p>
						<strong>Component:</strong> {name}
					</p>
					<p>
						<strong>Message:</strong> {error.message}
					</p>
					<p>
						<strong>Stack:</strong>
					</p>
					<pre>{error.stack}</pre>
				</div>
			)}
		>
			{children}
		</ErrorBoundary>
	);
};

export default ErrorCatcher;
