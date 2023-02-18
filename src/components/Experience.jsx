import React from 'react';

const Experience = () => {
  const data = [
    {
      job: 'Application Developer',
      date: '2023',
      company: 'Application Developer',
      duration: '1 year',
      desc: 'Worked on modernizing our older repositories and integrated salesforce using lambda functions, SNS, SQS, secrets manager and other services using NodeJs and typescript. \
      Implemented the serverless framework to improve deployment time and added logging for improved visibility. \
      Implemented Datadog monitoring across AWS services for better observability. \
      Followed test-driven development and increased code coverage from 70% to 95%',
    },
    {
      job: 'Associate Software Developer',
      date: '2022',
      company: 'OnPoint - A Koch Engineered Solutions Company',
      duration: '8 months',
      desc: 'Designed and developed user management and organization management applications using VueJs & typescript which improved onboarding time for our assets and companies. \
      Created beautiful tables to display information from DynamoDB. \
      Worked with an agile team of 10 members and participated in daily \
      stand-up meetings. \
      Maintained website and solved Visual & Workflow bugs while using Jest to create tests and improve code coverage.',
    },
    {
      job: 'Software Engineer Intern',
      date: '2021',
      company: 'OnPoint - A Koch Engineered Solutions Company',
      duration: '4 months',
      desc: 'Used VueJS to create UI components for our application by following Figma design docs, \
        implemented storybook which allowed us to have better documentation and streamline UI development,\
       implemented Dark/Light mode for one of our components using SASS.',
    },
  ];

  return (
    <div className="container mx-auto">
      <h1 className="text-center uppercase text-primary text-4xl py-8">
        Work Experience
      </h1>
      <div className="flex items-center justify-center py-10">
        <div className="max-w-screen-sm lg:max-w-screen-md xl:max-w-screen-lg px-20 ">
          <ol className="relative border-l-4 border-indigo-600 leading-loose">
            {data.map((item) => {
              return (
                <li key={item.date} className="mb-10 ml-6 md:w-[400px]">
                  <div className="absolute w-4 h-4 bg-white border-4 border-indigo-600 rounded-full -left-[0.6rem]"></div>
                  <p className="absolute -left-[3.5rem] p-0 m-0 font-bold text-secondary">
                    {item.date}
                  </p>
                  <p className="font-bold text-lg mb-1 text-secondary">
                    {item.job}
                  </p>
                  <p className="text-red-200 font-bold text-sm mb-2">
                    {item.duration}
                  </p>
                  <p className="text-primary font-roboto">{item.desc}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
};

export default Experience;
