import { useMemo } from 'react'
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  BarChart,
  Bar,
  Cell,
  LineChart,
  Line,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatNumber, formatDate } from '@/lib/utils'
import { trainingData } from '@/data/studentData'
import type { TrainedModel, FeatureImportance } from '@/types'

interface PageProps {
  model: TrainedModel
  featureImportance: FeatureImportance[]
}

export function ModelPerformancePage({ model, featureImportance }: PageProps) {
  const actualVsPredicted = useMemo(() => {
    return model.testPredictions.map((p) => ({
      x: p.actual,
      y: p.predicted,
    }))
  }, [model])

  const residuals = useMemo(() => {
    return model.residuals.map((r) => ({
      predicted: r.predicted,
      residual: r.residual,
    }))
  }, [model])

  const residualDist = useMemo(() => {
    const bins = [
      { range: '<-5', count: 0 },
      { range: '-5 to -2', count: 0 },
      { range: '-2 to 0', count: 0 },
      { range: '0 to 2', count: 0 },
      { range: '2 to 5', count: 0 },
      { range: '>5', count: 0 },
    ]
    for (const r of model.residuals) {
      if (r.residual < -5) bins[0].count++
      else if (r.residual < -2) bins[1].count++
      else if (r.residual < 0) bins[2].count++
      else if (r.residual < 2) bins[3].count++
      else if (r.residual < 5) bins[4].count++
      else bins[5].count++
    }
    return bins
  }, [model])

  const coefData = featureImportance.map((f) => ({
    name: f.label,
    weight: model.weights[f.feature as keyof typeof model.weights] || 0,
    color: f.color,
  }))

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Model Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="success">Trained</Badge>
              <span className="text-xs text-muted-foreground">v{model.version}</span>
            </div>
            <h3 className="font-display text-sm font-semibold mb-3">Model Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Algorithm</span>
                <span className="font-medium text-right text-xs">Linear Regression (OLS)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Training Date</span>
                <span className="font-medium text-xs">{formatDate(model.trainedAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Train Size</span>
                <span className="font-medium tabular-nums">{model.metrics.trainSize}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Test Size</span>
                <span className="font-medium tabular-nums">{model.metrics.testSize}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Features</span>
                <span className="font-medium text-xs">{model.featureNames.join(', ')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metrics */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Evaluation Metrics</CardTitle>
            <CardDescription>Performance on the held-out test set ({model.metrics.testSize} records)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-muted/30">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">MAE</p>
                <p className="font-display text-2xl font-bold text-foreground tabular-nums">
                  {formatNumber(model.metrics.mae, 2)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Mean Absolute Error</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/30">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">RMSE</p>
                <p className="font-display text-2xl font-bold text-foreground tabular-nums">
                  {formatNumber(model.metrics.rmse, 2)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Root Mean Squared Error</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/30">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">R² Score</p>
                <p className="font-display text-2xl font-bold tabular-nums"
                  style={{ color: model.metrics.r2 >= 0.7 ? 'hsl(142, 71%, 45%)' : model.metrics.r2 >= 0.5 ? 'hsl(38, 92%, 50%)' : 'hsl(0, 84%, 60%)' }}>
                  {formatNumber(model.metrics.r2, 4)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Coefficient of Determination</p>
              </div>
            </div>
            {model.metrics.r2 < 0 && (
              <div className="mt-4 p-3 rounded-md bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive">
                  Negative R² indicates the model performs worse than predicting the mean. The model
                  may need different features, more data, or a different algorithm.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actual vs Predicted Scatter */}
      <Card>
        <CardHeader>
          <CardTitle>Actual vs. Predicted Score</CardTitle>
          <CardDescription>
            Each point represents a test-set prediction. The diagonal line represents perfect predictions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <ScatterChart margin={{ top: 10, right: 30, bottom: 30, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                type="number"
                dataKey="x"
                name="Actual"
                domain={[0, 100]}
                label={{ value: 'Actual Score', position: 'bottom', offset: 10, fontSize: 12 }}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="Predicted"
                domain={[0, 100]}
                label={{ value: 'Predicted Score', angle: -90, position: 'insideLeft', fontSize: 12 }}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', fontSize: '12px' }}
                formatter={(v: number, name: string) => [v.toFixed(1), name === 'x' ? 'Actual' : 'Predicted']}
              />
              <ReferenceLine segment={[{ x: 0, y: 0 }, { x: 100, y: 100 }]} stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" />
              <Scatter data={actualVsPredicted} fill="hsl(230, 55%, 50%)" fillOpacity={0.7} />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Residual Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Residual Distribution</CardTitle>
            <CardDescription>How prediction errors are distributed</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={residualDist} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="range" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', fontSize: '12px' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="hsl(172, 70%, 40%)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Residuals vs Predicted */}
        <Card>
          <CardHeader>
            <CardTitle>Residuals vs. Predicted</CardTitle>
            <CardDescription>Check for patterns in prediction errors</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  type="number"
                  dataKey="predicted"
                  name="Predicted"
                  domain={[0, 100]}
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Predicted', position: 'bottom', offset: 5, fontSize: 11 }}
                />
                <YAxis
                  type="number"
                  dataKey="residual"
                  name="Residual"
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Residual', angle: -90, position: 'insideLeft', fontSize: 11 }}
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', fontSize: '12px' }}
                  formatter={(v: number) => v.toFixed(2)}
                />
                <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                <Scatter data={residuals} fill="hsl(32, 95%, 50%)" fillOpacity={0.7} />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Feature Coefficients */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Coefficients</CardTitle>
          <CardDescription>
            Learned weights from the linear regression model. Positive values increase the predicted score.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              {featureImportance.map((f) => {
                const rawWeight = model.weights[f.feature as keyof typeof model.weights] || 0
                return (
                  <div key={f.feature}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{f.label}</span>
                      <span className="font-display text-sm font-bold tabular-nums"
                        style={{ color: rawWeight >= 0 ? 'hsl(142, 71%, 45%)' : 'hsl(0, 84%, 60%)' }}>
                        {rawWeight >= 0 ? '+' : ''}{formatNumber(rawWeight, 4)}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${f.normalizedWeight}%`, background: f.color }}
                      />
                    </div>
                  </div>
                )
              })}
              <div className="pt-3 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Intercept (Bias)</span>
                  <span className="font-display text-sm font-bold tabular-nums">
                    {formatNumber(model.weights.bias, 4)}
                  </span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={coefData} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={90} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', fontSize: '12px' }}
                  formatter={(v: number) => v.toFixed(4)}
                />
                <Bar dataKey="weight" radius={[0, 4, 4, 0]}>
                  {coefData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Limitations */}
      <Card className="bg-muted/30 border-dashed">
        <CardHeader>
          <CardTitle>Model Limitations</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>The model is trained on {trainingData.length} synthetic records for educational demonstration, not real-world student data.</li>
            <li>Linear Regression assumes a linear relationship between features and the target. Real academic performance may involve non-linear interactions.</li>
            <li>A high R² score on the test set does not guarantee reliable predictions for individual students — it measures average fit, not individual accuracy.</li>
            <li>The model estimates correlations in the training data, not causal relationships. Increasing study hours in the model does not prove it will improve a specific student's score.</li>
            <li>The model has not been compared with alternative algorithms (e.g., Ridge, Lasso, Random Forest). Linear Regression may not be optimal for this task.</li>
            <li>Three features may not capture all factors affecting academic performance (e.g., motivation, teaching quality, socioeconomic factors).</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
