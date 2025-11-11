import React, { useState, useEffect } from "react";
import {
  List,
  Datagrid,
  TextField,
  Edit,
  SimpleForm,
  TextInput,
  BooleanInput,
  Create,
  Show,
  SimpleShowLayout,
  EditButton,
  useRecordContext,
} from "react-admin";
import {
  Box,
  Paper,
  Typography,
  Divider,
  LinearProgress,
  Button,
} from "@mui/material";
import { analyzeSeoContent } from "./analyzer";
import { runPageSpeedForUrl } from "./pagespeedClient";

function SeoReportCard({ report, performance }) {
  if (!report) return null;
  return (
    <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
      <Typography variant="subtitle1">SEO Report</Typography>
      <Divider sx={{ my: 1 }} />
      <Typography variant="body2">Score: {report.score}/100</Typography>
      <LinearProgress
        variant="determinate"
        value={report.score}
        sx={{ my: 1 }}
      />
      <Typography variant="body2">Words: {report.wordCount}</Typography>
      {performance && (
        <>
          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle2">Performance</Typography>
          <Typography variant="body2">
            Lighthouse Score: {performance.lighthouseScore}
          </Typography>
          <Typography variant="body2">LCP: {performance.lcp}</Typography>
          <Typography variant="body2">CLS: {performance.cls}</Typography>
        </>
      )}
      <Divider sx={{ my: 1 }} />
      {report.tips?.length > 0 && (
        <>
          <Typography variant="subtitle2">Suggestions</Typography>
          <ul>
            {report.tips.map((t, i) => (
              <li key={i}>
                <Typography variant="body2">{t}</Typography>
              </li>
            ))}
          </ul>
        </>
      )}
    </Paper>
  );
}

const SeoReport = ({ performance }) => {
  const record = useRecordContext(); // now it's accessible
  const [report, setReport] = useState(null);

  useEffect(() => {
    if (record) setReport(analyzeSeoContent(record));
  }, [record]);

  if (!report) return null;
  return <SeoReportCard report={report} performance={performance} />;
};

export const SeoList = (props) => (
  <List {...props}>
    <Datagrid rowClick="edit">
      <TextField source="id" />
      <TextField source="slug" />
      <TextField source="title" />
      <TextField source="score" />
      <EditButton />
    </Datagrid>
  </List>
);

export const SeoEdit = (props) => {
  const [performance, setPerformance] = useState(null);

  const handleRunPageSpeed = async (record) => {
    const url =
      record?.canonical || `${process.env.NEXT_PUBLIC_API_URL}/${record?.slug}`;
    const perf = await runPageSpeedForUrl(url);
    setPerformance(perf);
  };

  return (
    <Edit {...props}>
      <SimpleForm>
        <TextInput source="title" fullWidth />
        <TextInput source="slug" fullWidth />
        <TextInput source="canonical" fullWidth />
        <TextInput source="focus_keyword" />
        <TextInput multiline source="meta_description" />
        <TextInput multiline source="content" />
        <BooleanInput source="noindex" />
        <BooleanInput source="nofollow" />

        <Button variant="contained" onClick={() => handleRunPageSpeed(record)}>
          Run PageSpeed
        </Button>

        <SeoReport performance={performance} />
      </SimpleForm>
    </Edit>
  );
};

export const SeoCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="title" fullWidth />
      <TextInput source="slug" fullWidth />
      <TextInput source="canonical" fullWidth />
      <TextInput source="focus_keyword" fullWidth />
      <TextInput multiline source="meta_description" fullWidth />
      <TextInput multiline source="content" fullWidth />
      <BooleanInput source="noindex" />
      <BooleanInput source="nofollow" />
    </SimpleForm>
  </Create>
);
export const SeoShow = (props) => (
  <Show {...props}>
    <SimpleShowLayout>
      <TextField source="title" />
      <TextField source="slug" />
      <TextField source="score" />
    </SimpleShowLayout>
  </Show>
);
