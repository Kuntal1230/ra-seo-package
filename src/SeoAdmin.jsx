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
  useEditController,
  useNotify,
  useRefresh,
} from "react-admin";
import {
  Box,
  Paper,
  Typography,
  Divider,
  LinearProgress,
  Button,
} from "@mui/material";
import { runPageSpeedForUrl } from "./pagespeedClient";
import { analyzeSeoFromUrl } from "./analyzeSeoFromUrl";
import SyncIcon from "@mui/icons-material/Sync";

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

const SeoListActions = () => {
  const notify = useNotify();
  const refresh = useRefresh();

  const handleSync = async () => {
    try {
      const res = await fetch("/api/seo/sync");
      const data = await res.json();
      if (data.success) {
        notify(`✅ Synced ${data.count} URLs successfully`);
        refresh();
      } else {
        notify("Failed to sync URLs", { type: "warning" });
      }
    } catch (err) {
      console.error(err);
      notify("Error syncing SEO URLs", { type: "error" });
    }
  };

  return (
    <TopToolbar>
      <Button
        onClick={handleSync}
        startIcon={<SyncIcon />}
        color="primary"
        variant="contained"
        sx={{ textTransform: "none", mr: 1 }}
      >
        Sync URLs
      </Button>
      <CreateButton />
    </TopToolbar>
  );
};

export const SeoList = (props) => (
  <List {...props} title="SEO URLs" actions={<SeoListActions />}>
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
  // Get record from edit controller
  const { record } = useEditController(props);

  const [report, setReport] = useState(null);
  const [performance, setPerformance] = useState(null);

  useEffect(() => {
    const handleRunLiveAnalysis = async () => {
      const url =
        record?.canonical ||
        `${process.env.NEXT_PUBLIC_SITE_URL}/${record?.slug}`;
      const liveReport = await analyzeSeoFromUrl(url, record?.focus_keyword);
      setReport(liveReport);
    };
    if (record) handleRunLiveAnalysis();
  }, [record]);

  const handleRunPageSpeed = async () => {
    if (!record) return; // safety check
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

        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" gutterBottom>
          Open Graph (Facebook / LinkedIn)
        </Typography>
        <TextInput source="og_title" fullWidth />
        <TextInput source="og_description" fullWidth multiline />
        <TextInput source="og_image" label="OG Image URL" fullWidth />

        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" gutterBottom>
          Twitter Card
        </Typography>
        <TextInput source="twitter_title" fullWidth />
        <TextInput source="twitter_description" fullWidth multiline />
        <TextInput source="twitter_image" label="Twitter Image URL" fullWidth />

        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" gutterBottom>
          Structured Data (JSON-LD)
        </Typography>
        <TextInput
          source="structured_data"
          label="Structured Data (JSON-LD)"
          multiline
          fullWidth
          helperText="Paste valid JSON-LD schema (e.g. Organization, Article, Product)"
        />
        <Button
          variant="outlined"
          onClick={() =>
            window.open(
              `https://search.google.com/test/rich-results?url=${encodeURIComponent(
                record?.canonical
              )}`
            )
          }
        >
          Validate Structured Data
        </Button>

        <Button variant="contained" onClick={() => handleRunPageSpeed()}>
          Run PageSpeed
        </Button>

        {record && <SeoReportCard report={report} performance={performance} />}
      </SimpleForm>
    </Edit>
  );
};

export const SeoCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="title" fullWidth />
      <TextInput source="slug" fullWidth />
      <TextInput source="focus_keyword" fullWidth />
      <TextInput multiline source="meta_description" fullWidth />
      <TextInput source="canonical" fullWidth />
      <BooleanInput source="noindex" />
      <BooleanInput source="nofollow" />

      <Divider sx={{ my: 2 }} />
      <Typography variant="h6" gutterBottom>
        Open Graph (Facebook / LinkedIn)
      </Typography>
      <TextInput source="og_title" fullWidth />
      <TextInput source="og_description" fullWidth multiline />
      <TextInput source="og_image" label="OG Image URL" fullWidth />

      <Divider sx={{ my: 2 }} />
      <Typography variant="h6" gutterBottom>
        Twitter Card
      </Typography>
      <TextInput source="twitter_title" fullWidth />
      <TextInput source="twitter_description" fullWidth multiline />
      <TextInput source="twitter_image" label="Twitter Image URL" fullWidth />

      <Divider sx={{ my: 2 }} />
      <Typography variant="h6" gutterBottom>
        Structured Data (JSON-LD)
      </Typography>
      <TextInput
        source="structured_data"
        label="Structured Data (JSON-LD)"
        multiline
        fullWidth
        helperText="Paste valid JSON-LD schema (e.g. Organization, Article, Product)"
      />
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
