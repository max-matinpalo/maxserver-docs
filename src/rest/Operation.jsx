import { useState } from 'preact/hooks';
import { Icon } from '../ui/Icon.jsx';
import { Pill } from '../ui/Pill.jsx';
import { Markdown } from '../docs/Markdown.jsx';
import { InputSection } from '../docs/InputSection.jsx';
import { SchemaField } from '../schema/SchemaField.jsx';
import { SchemaFields } from '../schema/SchemaFields.jsx';
import { Responses } from './Responses.jsx';
import { EndpointBar } from '../docs/EndpointBar.jsx';
import { ExampleCard } from '../docs/ExampleCard.jsx';
import { RequestPanel } from './RequestPanel.jsx';
import styles from './Operation.module.css';

const PARAM_SECTIONS = [['path', 'Path Parameters'], ['query', 'Query Parameters'], ['header', 'Headers'], ['cookie', 'Cookies']];


/**
 * One route: description, inputs and responses left; endpoint and
 * example right.
 */
export function Operation({ op }) {
	const [testing, setTesting] = useState(false);

	return (
		<section id={op.id} data-anchor class={styles.operation}>
			<div class={styles.left}>
				<h3 class={styles.title}>{op.label}</h3>
				<Markdown text={op.description} />

				{PARAM_SECTIONS.map(([key, title]) => op.params[key].length > 0 && (
					<InputSection key={key} title={title}>
						{op.params[key].map(p => (
							<SchemaField key={p.name} name={p.name} required={p.required}
								schema={p.description ? { ...p.schema, description: p.description } : p.schema} />
						))}
					</InputSection>
				))}

				{op.body && (
					<InputSection title="Body" badges={<>{op.body.required && <Pill tone="required">required</Pill>}<Pill>{op.body.contentType}</Pill></>}>
						<Markdown text={op.body.description} muted />
						<SchemaFields schema={op.body.schema} />
					</InputSection>
				)}

				<Responses responses={op.responses} />
			</div>

			<div class={styles.right}>
				<div class={styles.sticky}>
					<div class={styles.actions}>{op.auth && <><Icon name="lock" size={14} /> Auth Required</>}</div>
					<EndpointBar method={op.method} path={op.path} onTest={() => setTesting(true)} />
					<ExampleCard responses={op.responses} />
				</div>
			</div>

			{testing && <RequestPanel op={op} onClose={() => setTesting(false)} />}
		</section>
	);
}
