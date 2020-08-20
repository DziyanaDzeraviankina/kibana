/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { FtrProviderContext } from '../../ftr_provider_context';

import { MachineLearningAnomaliesTableProvider } from './anomalies_table';
import { MachineLearningAnomalyExplorerProvider } from './anomaly_explorer';
import { MachineLearningAPIProvider } from './api';
import { MachineLearningCommonAPIProvider } from './common_api';
import { MachineLearningCommonUIProvider } from './common_ui';
import { MachineLearningCustomUrlsProvider } from './custom_urls';
import { MachineLearningDataFrameAnalyticsProvider } from './data_frame_analytics';
import { MachineLearningDataFrameAnalyticsCreationProvider } from './data_frame_analytics_creation';
import { MachineLearningDataFrameAnalyticsEditProvider } from './data_frame_analytics_edit';
import { MachineLearningDataFrameAnalyticsTableProvider } from './data_frame_analytics_table';
import { MachineLearningDataVisualizerProvider } from './data_visualizer';
import { MachineLearningDataVisualizerFileBasedProvider } from './data_visualizer_file_based';
import { MachineLearningDataVisualizerIndexBasedProvider } from './data_visualizer_index_based';
import { MachineLearningJobManagementProvider } from './job_management';
import { MachineLearningJobSelectionProvider } from './job_selection';
import { MachineLearningJobSourceSelectionProvider } from './job_source_selection';
import { MachineLearningJobTableProvider } from './job_table';
import { MachineLearningJobTypeSelectionProvider } from './job_type_selection';
import { MachineLearningJobWizardAdvancedProvider } from './job_wizard_advanced';
import { MachineLearningJobWizardCommonProvider } from './job_wizard_common';
import { MachineLearningJobWizardCategorizationProvider } from './job_wizard_categorization';
import { MachineLearningJobWizardMultiMetricProvider } from './job_wizard_multi_metric';
import { MachineLearningJobWizardPopulationProvider } from './job_wizard_population';
import { MachineLearningNavigationProvider } from './navigation';
import { MachineLearningSecurityCommonProvider } from './security_common';
import { MachineLearningSecurityUIProvider } from './security_ui';
import { MachineLearningSettingsProvider } from './settings';
import { MachineLearningSingleMetricViewerProvider } from './single_metric_viewer';
import { MachineLearningTestExecutionProvider } from './test_execution';
import { MachineLearningTestResourcesProvider } from './test_resources';

export function MachineLearningProvider(context: FtrProviderContext) {
  const commonAPI = MachineLearningCommonAPIProvider(context);
  const commonUI = MachineLearningCommonUIProvider(context);

  const anomaliesTable = MachineLearningAnomaliesTableProvider(context);
  const anomalyExplorer = MachineLearningAnomalyExplorerProvider(context);
  const api = MachineLearningAPIProvider(context);
  const customUrls = MachineLearningCustomUrlsProvider(context);
  const dataFrameAnalytics = MachineLearningDataFrameAnalyticsProvider(context, api);
  const dataFrameAnalyticsCreation = MachineLearningDataFrameAnalyticsCreationProvider(
    context,
    commonUI,
    api
  );
  const dataFrameAnalyticsEdit = MachineLearningDataFrameAnalyticsEditProvider(context, commonUI);
  const dataFrameAnalyticsTable = MachineLearningDataFrameAnalyticsTableProvider(context);
  const dataVisualizer = MachineLearningDataVisualizerProvider(context);
  const dataVisualizerFileBased = MachineLearningDataVisualizerFileBasedProvider(context, commonUI);
  const dataVisualizerIndexBased = MachineLearningDataVisualizerIndexBasedProvider(context);
  const jobManagement = MachineLearningJobManagementProvider(context, api);
  const jobSelection = MachineLearningJobSelectionProvider(context);
  const jobSourceSelection = MachineLearningJobSourceSelectionProvider(context);
  const jobTable = MachineLearningJobTableProvider(context);
  const jobTypeSelection = MachineLearningJobTypeSelectionProvider(context);
  const jobWizardAdvanced = MachineLearningJobWizardAdvancedProvider(context, commonUI);
  const jobWizardCategorization = MachineLearningJobWizardCategorizationProvider(context);
  const jobWizardCommon = MachineLearningJobWizardCommonProvider(context, commonUI, customUrls);
  const jobWizardMultiMetric = MachineLearningJobWizardMultiMetricProvider(context);
  const jobWizardPopulation = MachineLearningJobWizardPopulationProvider(context);
  const navigation = MachineLearningNavigationProvider(context);
  const securityCommon = MachineLearningSecurityCommonProvider(context);
  const securityUI = MachineLearningSecurityUIProvider(context, securityCommon);
  const settings = MachineLearningSettingsProvider(context);
  const singleMetricViewer = MachineLearningSingleMetricViewerProvider(context);
  const testExecution = MachineLearningTestExecutionProvider(context);
  const testResources = MachineLearningTestResourcesProvider(context);

  return {
    anomaliesTable,
    anomalyExplorer,
    api,
    commonAPI,
    commonUI,
    customUrls,
    dataFrameAnalytics,
    dataFrameAnalyticsCreation,
    dataFrameAnalyticsEdit,
    dataFrameAnalyticsTable,
    dataVisualizer,
    dataVisualizerFileBased,
    dataVisualizerIndexBased,
    jobManagement,
    jobSelection,
    jobSourceSelection,
    jobTable,
    jobTypeSelection,
    jobWizardAdvanced,
    jobWizardCategorization,
    jobWizardCommon,
    jobWizardMultiMetric,
    jobWizardPopulation,
    navigation,
    securityCommon,
    securityUI,
    settings,
    singleMetricViewer,
    testExecution,
    testResources,
  };
}
