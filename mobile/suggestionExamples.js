export const exampleResume = { _id: 'sample-resume', name: 'Jamie Rivera – Resume.pdf' };

export const exampleApplications = [
  { _id: 'sample-frontend', jobTitle: 'Frontend Intern', company: 'Fieldwork Studio', status: 'interviewing', hasJobDescription: true },
  { _id: 'sample-data', jobTitle: 'Data Analyst Intern', company: 'Commonline', status: 'offer', hasJobDescription: true },
  { _id: 'sample-product', jobTitle: 'Product Intern', company: 'Evergreen Labs', status: 'applied', hasJobDescription: false },
];

const exampleSuggestions = {
  'sample-frontend': [
    {
      category: 'Project',
      title: 'Build an accessible application dashboard',
      rationale: 'The frontend role calls for React and accessibility. A small dashboard would give Jamie a concrete example to discuss alongside the coursework on their resume.',
      nextSteps: [
        'Build a searchable list with loading, empty, and error states.',
        'Test the keyboard flow and document one accessibility fix with a before-and-after example.',
      ],
    },
    {
      category: 'Portfolio',
      title: 'Show how you make interface decisions',
      rationale: 'A short case study gives the team a way to evaluate the design and implementation choices behind the finished screen.',
      nextSteps: [
        'Add a 60-second demo to the project README.',
        'Explain one trade-off you made and how you tested the result.',
      ],
    },
  ],
  'sample-data': [
    {
      category: 'Project',
      title: 'Turn a public dataset into a decision brief',
      rationale: 'The analyst role asks for SQL and clear communication. A focused analysis would let Jamie demonstrate both in one project.',
      nextSteps: [
        'Use SQL to answer one question with a public dataset.',
        'Publish two charts with a one-page summary of the findings and limitations.',
      ],
    },
  ],
};

export function getExampleSuggestions(applicationIds) {
  return applicationIds.flatMap(id => exampleSuggestions[id] ?? []);
}
